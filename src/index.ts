import { type Plugin, createLogger } from 'vite'
import fs from 'fs'
import path from 'path'

function findFilesByRegex(
    lookupDir: string,
    languages: string[],
    results: { [key: string]: string[] } = {}
) {
    const files = fs.readdirSync(lookupDir)

    if (!Object.keys(results).length) {
        for (const language of languages) {
            results[language] = []
        }
    }

    for (const file of files) {
        const filePath = path.join(lookupDir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            findFilesByRegex(filePath, languages, results)
        } else {
            for (const language of languages) {
                if (new RegExp(`((\\.|-){1}|^)${language}\.json$`).test(file)) {
                    results[language].push(filePath)
                }
            }
        }
    }

    return results
}

function deepMerge(target: any, source: any) {
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = target[key] || {}
            deepMerge(target[key], source[key])
        } else {
            target[key] = source[key]
        }
    }
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
        name: 'vite-plugin-i18n-collector',

        buildStart() {
            const files = findFilesByRegex(lookupDir, languages)
            const combinedData: { [key: string]: object } = {}

            for (const language of languages) {
                combinedData[language] = {}

                for (const file of files[language]) {
                    const parsedFile = JSON.parse(fs.readFileSync(file, 'utf8'))
                    deepMerge(combinedData[language], parsedFile)
                }

                if (!fs.existsSync(saveDir)) {
                    fs.mkdirSync(saveDir, { recursive: true })
                }

                const filename = path.join(saveDir, `${language}.json`)
                fs.writeFileSync(filename, JSON.stringify(combinedData[language]), 'utf-8')
            }
        },

        async handleHotUpdate(ctx) {
            if (!ctx.file.endsWith('.json') || ctx.file.includes(saveDir)) {
                return
            }

            let isProcessable = false
            let language = ''

            for (const lang of languages) {
                if (new RegExp(`((\\.|-){1}|^)${lang}\.json$`).test(path.basename(ctx.file))) {
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
                const filename = path.join(saveDir, `${language}.json`)
                const commonFile = fs.readFileSync(filename, 'utf-8')
                const combinedData = {
                    ...(commonFile ? JSON.parse(commonFile) : {})
                }

                deepMerge(combinedData, JSON.parse(content))

                fs.writeFileSync(filename, JSON.stringify(combinedData), 'utf-8')
            } catch (e) {
                const logger = createLogger('warn', { prefix: 'vite-plugin-i18n-collector' })
                logger.error(e as string)
            }
        }
    }
}
