class LockdownEssayPage {
  title = 'Lockdown Essay | AKW';
  viewUrl = 'lockdown-essay/lockdown-essay';

  constructor() {
  }

  onInit() {
    console.log($element('sewHelp'));
  }
}

av.createPage(LockdownEssayPage, 'lockdown-essay');