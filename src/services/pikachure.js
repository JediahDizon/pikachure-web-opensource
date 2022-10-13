class Pikachure {
	URL = "";
	TOKEN_URL = "";

	constructor() {
		switch (process.env.NODE_ENV) {
			case "production": {
				this.URL = "https://pikachure-server.online"
				break;
			}

			case "development": {
				this.URL = "https://pikachure-server.online"
				//this.URL = "http://192.168.1.109"
				this.URL = "http://localhost";
				break;
			}

			default: { }
		}

		this.TOKEN_ENDPOINT = `${this.URL}/token`;
		this.AUTH_TOKEN_ENDPOINT = `${this.URL}/verifyToken`;
	}
}

export default new Pikachure();