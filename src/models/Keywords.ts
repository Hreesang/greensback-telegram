import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';

export type Keyword = GoogleSpreadsheetRow & {
  key: string;
  text: string;
};

class Keywords {
  private isAuthorized: boolean;
  // Keywords are cached and will be refreshed every 1 minute.
  // It itends to reduce too much API calls.
  private cachedKeywords: Keyword[];
  private lastKeywordsCallTime: number;

  protected readonly sheetId: string | undefined;
  protected readonly clientEmail: string;
  protected readonly privateKey: string;

  public doc: GoogleSpreadsheet;

  constructor() {
    this.isAuthorized = false;
    this.cachedKeywords = [];
    this.lastKeywordsCallTime = 0;

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
    // If last keywords API call is less than 1 minute ago, it returns
    // the cached keywords
    const currentDate = Date.now();
    if (currentDate - this.lastKeywordsCallTime < 60000) {
      return this.cachedKeywords;
    }

    try {
      // Sets last keywords API call time to the current time to avoid
      // being called at the same time
      this.lastKeywordsCallTime = currentDate;
      await this.auth();

      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByTitle['keywords'];
      this.cachedKeywords = (await sheet.getRows()) as Keyword[];

      // Updates the last call API time to the actual current time
      this.lastKeywordsCallTime = Date.now();

      return this.cachedKeywords;
    } catch (e) {
      throw e;
    }
  };
}

export default Keywords;
