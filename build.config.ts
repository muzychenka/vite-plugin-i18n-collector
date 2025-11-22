import { defineBuildConfig } from 'unbuild'

import { peerDependencies } from './package.json'

export default defineBuildConfig({
    entries: ['src/index'],
    externals: [...Object.keys(peerDependencies)],
    clean: true,
    declaration: true,
    rollup: {
        inlineDependencies: true
    }
})
