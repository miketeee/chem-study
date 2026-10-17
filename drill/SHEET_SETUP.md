# Connect the Chem Study Hub to a Google Sheet

Same setup as the CCMA and Micro practice sites, with its own new Sheet so chemistry answers never mix with the others. One connection covers the whole hub: Practice Bank answers, quiz-page answers, and your per-question notes.

1. Create a new blank Google Sheet (name it something like **Chem Study Hub**).
2. In the Sheet: **Extensions → Apps Script**. Delete the starter code and paste everything from `Code.gs` (in this folder).
3. Near the top, change `SECRET = 'change-this-phrase'` to your own secret phrase. Save.
4. **Deploy → New deployment** → gear icon → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and approve the permissions prompt.
5. Copy the **Web app URL** (it starts with `https://script.google.com/` and ends with `/exec`).
6. On your GitHub Pages copy of the site, open **Practice Bank** → click **Google Sheet: not connected** → paste the URL and your secret phrase → **Connect and sync**.

Connect once per device (phone, laptop). Use the same URL and phrase on each and they share one history and one set of notes.

What you'll see in the Sheet:
- **Attempts**: one row per answer (when, device, where you answered it, homework, question, what you answered, right/wrong). Nothing is ever deleted.
- **Summary**: one row per question (times seen, right, wrong, last result). Rebuilt after every sync.
- **Notes**: one row per question you've written a note on.

Notes:
- Answers and notes are saved in the browser first, then sent. If the connection drops, they wait and go through on the next try.
- If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
- The claude.ai preview can't reach Google; sync only works from your GitHub Pages copy.
- Your old notes Sheet (from the earlier quiz site) isn't used anymore and stays as it was.
