import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';

export type User = GoogleSpreadsheetRow & {
  identifier: string;
  keywords_permitted: string;
};

class Users {
  private isAuthorized: boolean;

  protected readonly sheetId: string | undefined;
  protected readonly clientEmail: string;
  protected readonly privateKey: string;

  public doc: GoogleSpreadsheet;

  constructor() {
    this.isAuthorized = false;

    this.sheetId = process.env.GOOGLE_SHEET_ID;
    this.clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '';
    this.privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(
      /\\n/g,
      '\n'
    );

    this.doc = new GoogleSpreadsheet(this.sheetId);
  }

  private auth = async () => {
    if (this.isAuthorized) {
      return;
    }

    try {
      await this.doc.useServiceAccountAuth({
        client_email: this.clientEmail,
        private_key: this.privateKey,
      });
      this.isAuthorized = true;
    } catch (e) {
      throw e;
    }
  };

  public getAll = async () => {
    try {
      await this.auth();

      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByTitle['users'];
      const users = (await sheet.getRows()) as User[];

      return users;
    } catch (e) {
      throw e;
    }
  };

  public get = async (identifier: string) => {
    try {
      const users = await this.getAll();
      for (const user of users) {
        if (user.identifier === identifier) {
          return user;
        }
      }

      return undefined;
    } catch (e) {
      throw e;
    }
  };
}

export default Users;
