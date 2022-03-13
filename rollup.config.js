export default [{
    input: 'src/index.js',
    output: {
        file: 'public/game.js',
        format: 'iife'
    }
}, {
    input: 'server/core.js',
    output: {
        file: 'server.js',
        format: 'cjs'
    }
}]