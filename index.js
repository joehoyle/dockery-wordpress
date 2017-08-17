#!/usr/bin/env node
const { spawn, spawnSync } = require('child_process');
const { writeFile, readFileSync } = require('fs');
const prog = require('caporal');

prog
	.version('1.0.0')
	.command('init', 'Deploy an application')
	.action((args, options, logger) => {
		const config = {
			hostname: 'wordpress-test.local',
			port: Math.floor(Math.random() * (80000 - 30000) + 30000),
		};
		writeFile(
			`${process.cwd()}/.dockery-wordpress.conf`,
			JSON.stringify(config, null, '\t') + '\n',
			() => {}
		);
		console.log(
			'Generated new project. Run "dockery-wordpress start" to get going!'
		);
	})
	.command('install', 'Install an application')
	.action((args, options, logger) => {
		createContainer(logger);
	})
	.command('reinstall', 'Reinstall an application')
	.action((args, options, logger) => {
		removeContainer();
		createContainer(logger);
	})
	.command('start', 'Run an application')
	.action((args, options, logger) => {
		const config = getConfig();
		const dockerProcess = spawn('docker', ['start', config.hostname, '-a']);
		dockerProcess.stdout.on('data', data => {
			logger.debug(`${data}`);
		});
		dockerProcess.stderr.on('data', data => {
			logger.warn(`${data}`);
		});
		dockerProcess.on('close', code => {
			console.debug(`child process exited with code ${code}`);
		});
		openWebsite();
	})
	.command('attach', 'Shell in to an application')
	.action((args, options, logger) => {
		const config = getConfig();
		const dockerProcess = spawn(
			'docker',
			['exec', '-i', '-t', config.hostname, '/bin/bash'],
			{ stdio: 'inherit' }
		);
	})
	.command('rebuild', 'Rebuild the base image')
	.action((args, options, logger) => {
		buildImage(logger);
	});

prog.parse(process.argv);

async function buildImage(logger) {
	return new Promise((accept, reject) => {
		logger.debug('Building docker base image...');
		const dockerProcess = spawn('docker', [
			'build',
			`${__dirname}/docker`,
			`-t`,
			'hm-application-local-dev',
		]);
		dockerProcess.stdout.on('data', data => {
			logger.debug(`${data}`);
		});
		dockerProcess.stderr.on('data', data => {
			logger.warn(`${data}`);
		});
		dockerProcess.on('close', code => {
			console.debug(`child process exited with code ${code}`);
			if (code === 0) {
				accept();
			} else {
				reject();
			}
		});
	});
}

async function createContainer(logger) {
	const config = getConfig();
	const dockerProcess = spawnSync('docker', [
		'create',
		'-p',
		`${config.port}:80`,
		'--hostname',
		config.hostname,
		'-v',
		`${process.cwd()}:/usr/src/app`,
		'--name',
		config.hostname,
		'hm-application-local-dev',
	]);
	if (dockerProcess.status !== 0) {
		logger.warn('Failed: ' + dockerProcess.stderr);
		return;
	}
}

function getConfig() {
	return JSON.parse(readFileSync(`${process.cwd()}/.dockery-wordpress.conf`));
}

function removeContainer() {
	const dockerProcess = spawnSync('docker', ['rm', getContainerId()]);
}

function getContainerId() {
	const dockerProcess = spawnSync('docker', [
		'ps',
		'-a',
		'--filter',
		`name=${getConfig().hostname}`,
	]);

	const lines = dockerProcess.stdout.toString().split('\n');
	if (lines.length < 2) {
		return null;
	}
	return lines[1].match(/^\S+/)[0];
}

function openWebsite() {
	const config = getConfig();
	spawn('open', [`http://localhost:${config.port}/`]);
}
