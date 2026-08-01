const { spawn } = require('child_process');

const commands = [
    { name: 'server', command: 'nodemon server.js' },
    { name: 'client', command: 'npm --prefix client run dev' }
];

const children = commands.map(({ name, command }) => {
    const child = spawn(command, {
        cwd: __dirname,
        env: process.env,
        stdio: 'inherit',
        shell: true
    });
    child.on('exit', code => {
        if (code && code !== 0) console.error(`${name} exited with code ${code}.`);
    });
    return child;
});

const stop = () => {
    children.forEach(child => child.kill());
    process.exit();
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
