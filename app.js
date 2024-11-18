const puppeteer = require("puppeteer");
const fs = require("fs");

// Function to extract name from email address and capitalize the first letter
function extractNameFromEmail(email) {
  const localPart = email.split('@')[0];
  let name;
  
  if (localPart.includes('.')) {
    const nameParts = localPart.split('.');
    name = nameParts[0];
    for (const part of nameParts) {
      if (part.length > name.length) {
        name = part;
      }
    }
  } else {
    name = localPart;
  }

  // Capitalize the first letter and make the rest lowercase
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Function to read emails from file and return a list of email addresses
function readEmailsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split(',').map(email => email.trim());
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Read the email addresses from email.txt
  const emails = readEmailsFromFile("emails.txt");
  const outputData = [];
  const outputData2 = [];
  const outputData3 = [];

  for (const email of emails) {
    const name = extractNameFromEmail(email);
    console.log(`Signing in as ${name} (${email})...`);

    try {
      // Navigate to the login page
      await page.goto("https://login.microsoftonline.com");

      // Wait for the email field to be visible
      await page.waitForSelector("#i0116");

      // Fill the email field
      await page.type("#i0116", email);

      // Click the sign-in button
      await page.click("#idSIButton9");

      // Wait for navigation after sign-in
      await page.waitForNavigation();

      // Get the current URL before and after sign-in
      const currentUrlBeforeSignIn = page.url();

      // Get the content of the page after sign-in
      const pageContent = await page.content();

      // Wait for 30 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Get the current URL after waiting
      const currentUrlAfterWait = page.url();

      // Check if there's a redirection or if the URL after waiting is "login.live.com"
      const isRedirection = currentUrlBeforeSignIn !== currentUrlAfterWait;
      const isLiveCom = currentUrlAfterWait.includes("login.live.com");
      const isGoDaddy = currentUrlAfterWait.includes("sso.godaddy.com");
      const isRedirectionOrLiveCom = isRedirection || isLiveCom;

      // Check if sign-in is unsuccessful due to wrong email
      const isSignInUnsuccessful = await page.evaluate(() => {
        const errorMessageElement = document.querySelector("#usernameError");
        return errorMessageElement !== null;
      });

      // If sign-in is unsuccessful, add name and email to outputData
      if (!isRedirectionOrLiveCom || isSignInUnsuccessful) {
        outputData.push({ name, email });
      } else if (isLiveCom || isSignInUnsuccessful) {
        outputData2.push({ name, email });
      } else if (isGoDaddy || isSignInUnsuccessful) {
        outputData3.push({ name, email });
      }

      // Print if there's a redirection, URL is "login.live.com", or sign-in is unsuccessful due to wrong email
      console.log(isRedirectionOrLiveCom);
    } catch (error) {
      // Handle timeout error
      console.error(
        "Timeout error occurred. Proceeding to the next object on the list."
      );
      continue;
    }
  }

  // Write outputData to output.json
  fs.writeFileSync("microsoft365.json", JSON.stringify(outputData, null, 2));
  fs.writeFileSync("outlook.json", JSON.stringify(outputData2, null, 2));
  fs.writeFileSync("godaddy.json", JSON.stringify(outputData3, null, 2));

  // Close the browser
  await browser.close();
})();
