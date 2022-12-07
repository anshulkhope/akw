class MyStuffPage {
  title = 'MyStuff | AKW';
  viewUrl = 'mystuff/mystuff';

  constructor() {
  }
  onInit() {
    scroll({top: 0, behavior: 'smooth'});
  }
}

av.createPage(MyStuffPage, 'mystuff');