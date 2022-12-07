const Routes = {
  'home': 'home/home.page.js',
  'about': ('about/about.page.js'),
  'lockdown-essay': ('lockdown-essay/lockdown-essay.page.js'),
  'mystuff': ('mystuff/mystuff.page.js'),
}

const App = new av.App(
  Routes,
  {
    icon: 'https://www.anshulkhope.com/themes/rainlab-vanilla/assets/img/favicon-32x32.png',
    verbose: 'high',
  }
);

av.app.init(App);

av.elements.ui.addStyleRefs('/src/styles.css');

let colorStyleText = 'color:red;font-size:2rem;font-weight:600;background-color:yellow';
console.log('%cWelcome to AKW!', colorStyleText);