import { type Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

function findAllLanguagesFiles(
    lookupDir: string,
    saveDir: string,
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
            findAllLanguagesFiles(filePath, saveDir, languages, results)
        } else {
            for (const language of languages) {
                if (langRegex(language).test(file) && !filePath.startsWith(saveDir)) {
                    results[language].push(filePath)
                }
            }
        }
    }

    return results
}

function findLanguageFiles(
    lookupDir: string,
    saveDir: string,
    language: string,
    results: string[] = []
) {
    const files = fs.readdirSync(lookupDir)

    for (const file of files) {
        const filePath = path.join(lookupDir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            findLanguageFiles(filePath, saveDir, language, results)
        } else {
            if (langRegex(language).test(file) && !filePath.startsWith(saveDir)) {
                results.push(filePath)
            }
        }
    }

    return results
}

function langRegex(language: string) {
    return new RegExp(`((\\.|-){1}|^)${language}\.json$`)
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

function ensureDir(path: string) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true })
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
            const files = findAllLanguagesFiles(lookupDir, saveDir, languages)
            const combinedData: { [key: string]: object } = {}

            for (const language of languages) {
                combinedData[language] = {}

                for (const file of files[language]) {
                    const parsedFile = JSON.parse(fs.readFileSync(file, 'utf8'))
                    deepMerge(combinedData[language], parsedFile)
                }

                ensureDir(saveDir)

                const filename = path.join(saveDir, `${language}.json`)
                fs.writeFileSync(filename, JSON.stringify(combinedData[language]), 'utf-8')
            }
        },

        async handleHotUpdate(ctx) {
            if (!ctx.file.endsWith('.json') || ctx.file.startsWith(saveDir)) {
                return
            }

            let isProcessable = false
            let language = ''

            for (const lang of languages) {
                if (langRegex(lang).test(path.basename(ctx.file))) {
                    isProcessable = true
                    language = lang
                    break
                }
            }

            if (!isProcessable) {
                return
            }

            const languageFiles = findLanguageFiles(lookupDir, saveDir, language)
            const combinedData = {}

            ensureDir(saveDir)

            for (const languageFile of languageFiles) {
                const parsedFile = JSON.parse(fs.readFileSync(languageFile, 'utf8'))
                deepMerge(combinedData, parsedFile)
            }

            const filename = path.join(saveDir, `${language}.json`)
            fs.writeFileSync(filename, JSON.stringify(combinedData), 'utf-8')
        }
    }
}
