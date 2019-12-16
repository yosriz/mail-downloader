import {google} from 'googleapis';
import {Logger} from "./logging";
import * as fs from "fs";
import * as readline from "readline";
import {OAuth2Client} from "google-auth-library";
import * as util from "util";

const asyncWriteFile = util.promisify(fs.writeFile);
const asyncReadFile = util.promisify(fs.readFile);

export class GMail {

    private readonly SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    private readonly TOKEN_PATH = 'token.json';
    private authClient?: OAuth2Client;

    constructor(private logger: Logger) {
        this.logger = logger;
    }

    public get isAuthenticate(): boolean {
        return this.authClient != undefined;
    }

    public async authenticate(): Promise<void> {
        const content = await asyncReadFile('config/credentials.json');
        this.authClient = await this.authorize(JSON.parse(content as any));
    }

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    async authorize(credentials: any): Promise<OAuth2Client> {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new OAuth2Client(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        try {
            const token = await asyncReadFile(this.TOKEN_PATH);
            oAuth2Client.setCredentials(JSON.parse(token as any));
        } catch (e) {
            await this.getNewToken(oAuth2Client);
        }
        return oAuth2Client;
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    async getNewToken(oAuth2Client: OAuth2Client): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.SCOPES,
            });
            this.logger.info('Authorize this app by visiting this url:' + authUrl);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                oAuth2Client.getToken(code, async (err: any, token: any) => {
                    if (err)
                        reject(err);
                    else {
                        oAuth2Client.setCredentials(token);
                        // Store the token to disk for later program executions
                        await asyncWriteFile(this.TOKEN_PATH, JSON.stringify(token));
                        this.logger.debug('Token stored to' + this.TOKEN_PATH);
                        resolve();
                    }
                });
            });
        });
    }

    /**
     * Lists the labels in the user's account.
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    listLabels(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const gmail = google.gmail({version: 'v1', auth: this.authClient as any});
            gmail.users.labels.list({
                userId: 'me',
            }, (err, res: any) => {
                if (err)
                    reject('The API returned an error: ' + err);
                const labels = res.data.labels;
                if (labels.length) {
                    resolve(labels);
                } else {
                    reject('No labels found.');
                }
            });
        });
    }


}
