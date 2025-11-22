export default {
    branches: ['main'],
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                releaseRules: [
                    { type: 'feat', release: 'minor' },
                    { type: 'fix', release: 'patch' },
                    { type: 'refactor', release: 'patch' },
                    { type: 'revert', release: 'patch' }
                ]
            }
        ],
        '@semantic-release/release-notes-generator',
        [
            '@semantic-release/changelog',
            {
                changelogFile: 'CHANGELOG.md'
            }
        ],
        [
            '@semantic-release/npm',
            {
                npmPublish: true
            }
        ],
        [
            '@semantic-release/git',
            {
                assets: ['CHANGELOG.md', 'package.json'],
                message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
            }
        ],
        [
            '@semantic-release/github',
            {
                successComment: false,
                releasedLabels: false
            }
        ]
    ]
}
