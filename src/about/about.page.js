class AboutPage {
  title = 'About | AKW';
  viewUrl = 'about/about';

  textArea = $element('fileout');

  constructor() {
  }
  onInit() {}

  showFileContent(content) {
      this.textArea.value = av.types.decodeFile(content);
  }
}

av.createPage(AboutPage, 'about');