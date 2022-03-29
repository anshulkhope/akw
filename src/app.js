sew.app.init({
    pages: {
        'home': sew.loadComponent('home/home.page.js'),
        'about': sew.loadComponent('about/about.page.js'),
        'covid-alert': sew.loadComponent('covid-alert/covid-alert.page.js'),
        'lockdown-essay': sew.loadComponent('lockdown-essay/lockdown-essay.page.js'),
        'mystuff': sew.loadComponent('mystuff/mystuff.page.js'),
        'header': sew.loadComponent('header/header.page.js'),
        'footer': sew.loadComponent('footer/footer.page.js'),
    },
    appPreferences: {
        icon: 'https://www.anshulkhope.com/themes/rainlab-vanilla/assets/img/favicon-32x32.png',
        mainView: ''
    }
});

sew.addStyleRefs('/src/styles.css');