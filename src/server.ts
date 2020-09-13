import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import express, { Application, NextFunction, Request, Response } from 'express';

import { config } from './config';
import { log } from './logger';
import { setupGraphQL } from './graphqlServer';

class Stream {
	public write(text: string) {
		log.info(text);
	}
}

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
	log.error(err);
	res.status(500).json({ error: err }).end();
}

export class Server {
	private app: Application;

	constructor() {
		const app = express();
		app.use(morgan('combined', { stream: new Stream() }));
		app.use(compression());
		app.use(
			helmet({
				contentSecurityPolicy: {
					directives: {
						defaultSrc: ['\'self\''],
						scriptSrc: [
							'\'self\'',
							'\'unsafe-inline\'',
							'fonts.googleapis.com',
							'fonts.gstatic.com',
							'cdn.jsdelivr.net/',
						],
						fontSrc: ['\'self\'', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net/'],
						styleSrc: [
							'\'self\'',
							'\'unsafe-inline\'',
							'fonts.googleapis.com',
							'fonts.gstatic.com',
							'cdn.jsdelivr.net/',
						],
						imgSrc: ['\'self\'', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net/'],
					},
				},
			})
		);
		app.use(cors());
		app.use(cookieParser());
		app.use(bodyParser.json());
		setupGraphQL(app);

		app.use(errorHandler);

		this.app = app;
	}

	public listen() {
		this.app.listen(config.port, () => {
			log.info(`server started at http://localhost:${config.port}`);
		});
	}
}
