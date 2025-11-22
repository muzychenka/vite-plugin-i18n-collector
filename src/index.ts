import { type Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

function findFilesByRegex(
    dir: string,
    regex: RegExp,
    languages: string[],
    results: { [key: string]: string[] } = {}
) {
    const files = fs.readdirSync(dir)

    if (!Object.keys(results).length) {
        for (const language of languages) {
            results[language] = []
        }
    }

    for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            findFilesByRegex(filePath, regex, languages, results)
        } else {
            for (const language of languages) {
                if (new RegExp(`^${language}.json`).test(file)) {
                    results[language].push(filePath)
                }
            }
        }
    }

    return results
}

export default function ({
    languages,
    saveDir,
    lookupDir
}: {
    languages: string[]
    saveDir: string
    lookupDir: string
}): Plugin {
    return {
        name: 'translations',

        buildStart() {
            const regex = new RegExp('(^' + languages.join('|') + ').json', 'i')
            const files = findFilesByRegex(lookupDir, regex, languages)
            const combinedData: { [key: string]: object } = {}

            for (const language of languages) {
                combinedData[language] = {}
                for (const file of files[language]) {
                    const parsedFile = JSON.parse(fs.readFileSync(file, 'utf8'))
                    Object.assign(combinedData[language], parsedFile)
                }

                if (!fs.existsSync(saveDir)) {
                    fs.mkdirSync(saveDir, { recursive: true })
                }

                fs.writeFileSync(
                    `${saveDir}/${language}.json`,
                    JSON.stringify(combinedData[language]),
                    'utf-8'
                )
            }
        },

        async handleHotUpdate(ctx) {
            if (!ctx.file.endsWith('.json') || ctx.file.startsWith(saveDir)) {
                return
            }

            let isProcessable = false
            let language = ''

            for (const lang of languages) {
                if (ctx.file.endsWith(`${lang}.json`)) {
                    isProcessable = true
                    language = lang
                    break
                }
            }

            if (!isProcessable) {
                return
            }

            const content = fs.readFileSync(ctx.file, 'utf-8')

            try {
                const commonFile = fs.readFileSync(`${saveDir}/${language}.json`, 'utf-8')
                const combinedData = {
                    ...(commonFile ? JSON.parse(commonFile) : {}),
                    ...JSON.parse(content)
                }

                fs.writeFileSync(
                    `${saveDir}/${language}.json`,
                    JSON.stringify(combinedData),
                    'utf-8'
                )
            } catch (e) {
                console.error(e)
            }
        }
    }
}
