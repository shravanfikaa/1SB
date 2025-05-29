const DOMAIN_REGEX = /^https?:\/\/([^\s/?#]+\.)?1silverbullet\.[^\s/?#]+([?&][^=\s&#]+(=[^&#]*)?)*/;

const VALIDATE_ARGS = {
  domainLink: {
    argName: 'domainLink',
    regex: DOMAIN_REGEX,
    error: '[1SilverBullet][user-onboarding] URL link provided is invalid. Please pass correct URL'
  },
  accessToken: {
    argName: 'accessToken',
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};': "\\|,.<>/?]).{8,}$/,
    error: '[1SilverBullet][user-onboarding] Access token provided is invalid.'
  },
};

class UserOnboarding {
  #iFrame = document.createElement("iframe");

  constructor({ distributerId = "", distributerLogoPath = "", domainLink, accessToken, width = '100vw', height = '100vw', backgroundColor = '#FFFFFF', top = '0', left = '', position = 'absolute', className = 'user-onboarding-iframe' }) {
    UserOnboarding.#evaluateArgs(
      domainLink,
      VALIDATE_ARGS.domainLink.argName
    );

    accessToken && UserOnboarding.#evaluateArgs(
      accessToken,
      VALIDATE_ARGS.accessToken.argName
    );

    UserOnboarding.#isValidUrl(domainLink);

    const paramArray = [];
    accessToken && paramArray.push(`accessToken=${accessToken}`);
    distributerId && paramArray.push(`distributerId=${distributerId}`);
    distributerLogoPath && paramArray.push(`distributerLogoPath=${distributerLogoPath}`);

    const queryParam = paramArray.join("&");

    this.domainLink = queryParam ? domainLink + "?" + queryParam : domainLink;
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
    this.position = position;
    this.left = left;
    this.top = top;
    this.className = className;
  }

  static #evaluateArgs(arg, argName) {
    if (arg === undefined || arg === null || !arg) {
      alert(`[1SilverBullet][user-onboarding] ${argName} is not passed but is required`);
      throw new Error(
        `[1SilverBullet][user-onboarding] ${argName} is not passed but is required`
      );
    }
    if (!arg.match(VALIDATE_ARGS[argName].regex)) {
      alert(VALIDATE_ARGS[argName].error);
      throw new Error(VALIDATE_ARGS[argName].error);
    }
  }

  static #isValidUrl(url) {
    let isValid = false;
    try {
      new URL(url);
      isValid = true;
    } catch (error) {
      isValid = false;
    }
    if (!isValid) {
      alert(`[1SilverBullet][user-onboarding] please provide valid URL.`);
      throw new Error(
        `[1SilverBullet][user-onboarding] please provide valid URL.`
      );
    }
  }

  #createIFrame() {
    const iframe = document.createElement("iframe");
    iframe.src = this.domainLink;
    iframe.className = this.className;
    iframe.style.position = this.position;
    iframe.style.top = this.top;
    iframe.style.left = this.left;
    iframe.width = this.width;
    iframe.height = this.height;
    iframe.style.border = "none";
    iframe.style.backgroundColor = this.backgroundColor;
    iframe.style.display = "flex";
    iframe.style.justifyContent = "center";
    iframe.style.alignItems = "center";
    iframe.style.boxShadow = "0 4px 8px 0 rgb(0 0 0 / 20%), 0 6px 20px 0 rgb(0 0 0 / 19%)";

    this.#iFrame = iframe;
    return iframe;
  }

  #renderIFrame() {
    const iframe = this.#createIFrame();
    const container = document.createElement("div");
    container.setAttribute("id", "iframe-container");
    container.append(iframe);
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.position = this.position;
    container.style.backgroundColor = this.backgroundColor;
    document.body.append(container);
  }

  start() {
    this.#renderIFrame();
  }
}

window.userOnboarding = UserOnboarding;

export default UserOnboarding;
