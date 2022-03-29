class AboutPage {
    title = 'About | AKW';
    viewUrl = 'about/about';

    textArea = sew.elements.get('fileout');

    init() {}

    showFileContent(content) {
        this.textArea.value = sew.getFileData(content);
    }
}

const _swComponent = AboutPage;