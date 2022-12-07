/*
 * A Visual v0.0.4
 * Copyright (c) 2021 - Anshul Khope, 'A Visual' Company
 *
 * A Visual is JavaScript library for easier handling of UI Components.
 * It is completely based on the idea of Components. Everything you see is a component;
 * even the app itself.
 *
 * Components can be decorated differently to get results such as buttons,
 * checkboxes, text inputs, links, cards, paragraphs, navbar, etc. av comes by default
 * with a CSS that you can use right away (no link-imports needed, the library
 * imports it by default!).
 *
 * :PS, You can even make the library import a custom stylesheet.
 *
 * In short:
 * av = Making WebGUIs easier!
 *
 */

'use strict';

/**
 * The main ***A Visual*** Object. Contains sub-classes for UI-elements, router and
 * other functions.
 */

const av = {

	/**
	 * Loads a component class.
	 * @param  {string} component The path to the component (`*.page.js`)
	 * @returns {Promise<string>}
	 */
	loadComponent: async (component) => {
		const res = await fetch('src/' + component);
		const componentClass = res.text();
		(new Function((await componentClass).toString()))();
	},

	/**
	 * The types object, used for storage different av-specific functions and types
	 */
	types: {

		UNDEFINED: null,

		/**
		 * Decodes the string given as per url-encoding.
		 * @param {string} data The url-encoded content of the file. The data passed to you
		 * by the file input element is url-encoded. No modifications needed for that type of data.
		 * @returns {string}
		 */
		decodeFile: (data) => {
			return decodeURI(data);
		},
	},

	/**
	 * This object is used to change the user's controls to the DOM.
	 */
	controls: {

		/**
		 * If the controls are allowed to be disabled. If set to false all controls will
		 * be enabled.
		 * @type boolean
		 * @default true
		 */
		shouldDisableControls: true,

		/**
		 * Disable a particular user-control.
		 * @param {string} control The control to disable. ['inspect' | 'contextmenu' | 'view-source' | 'select']
		 * @param {string} msgOnCtrlBreak **TODO**
		 */
		disable: (control , msgOnCtrlBreak) => {

			if (control === 'inspect' && av.controls.shouldDisableControls) {
				document.onkeydown = (e) => {
					if (e.key === 'F12') {
						av.elements.ui.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
					if (e.ctrlKey && e.shiftKey && e.key === 'I') {
						av.elements.ui.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
					if (e.ctrlKey && e.shiftKey && e.key === 'C') {
						av.elements.ui.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
					if (e.ctrlKey && e.shiftKey && e.key === 'J') {
						av.elements.ui.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
				}
			}
			else if (control === 'view-source' && av.controls.shouldDisableControls) {
				document.addEventListener('keydown', (e) => {
					if (e.ctrlKey && e.key === 'U') {
						av.elements.ui.showQuickToast('Error', 'View Source is disabled.');
						return false;
					}
				});
			}
			if (control === 'contextmenu' && av.controls.shouldDisableControls) {
				document.addEventListener('contextmenu', (event) => {
					event.preventDefault();
					av.elements.ui.showQuickToast('Error', 'Right Click is disabled.');
					return false;
				});
			}
			if (control === 'select' && av.controls.shouldDisableControls) {
				document.addEventListener('selectstart', (event) => {
					event.preventDefault();
					av.elements.ui.showQuickToast('Not bad', 'at all');
				});
				av.app.rootElement.classList.add('av-cursor-default');
				return false;
			}
		}
	},

	/**
	 * The router Object.
	 * One of the most important part of Av, the router matches corresponding routes with their
	 * pages and accordingly displays the content on `av.app.rootElement`
	 */
	router: {

		/**
		 * All the component route names to their component classes. Used by the router
		 * to just put the required page contents into the app rootElement.
		 * @type Object
		 * @default {}
		 */
		pages: {},

		/**
		 * The root or base path from which the routes/routing should work.
		 * @type {string}
		 * @default '/'
		 */
		rootPath: '/',

		/**
		 * Start the router. Also loads all pages asynchronously to provide blazing fast output.
		 * @param {av.App} app
		 */
		start: async (app) => {

			document.querySelector('base').href = av.router.rootPath;

			Object.keys(app.pages).forEach((page, index) => {
				av.router.pages[page] = av.loadComponent(Object.values(app.pages)[index]).then(() => {
					let vUrl;
					av.router.pages[page].then(d => vUrl = d.viewUrl);
					if (index === Object.keys(app.pages).length - 1) {
						av.app.loadingComplete = true;
					}

					if (location.hash !== '' || av.types.UNDEFINED) {
						av.router.navigate(location.hash.substring(1).replace('/', ''));
					} else {
						av.router.navigate(Object.keys(app.pages)[0]);
					}
				});
			});

			av.app.rootElement.setAttribute('route', 'default');
			av.router.loading = false;
		},

		/**
		 * Navigate to a page.
		 * @param {string} page The page name.
		 */
		navigate: async (page) => {
			if (av.router.pages[page] === undefined || null) {
				av.app.error('Unknown Error', 'router');

				const loader = av.elements.create('av-overlay', document.body,
					'<av-container><h4>Error: </h4></av-container>', false);
				loader.classList.add('av-overlay');
			} else {
				location.hash = '#/' + page;
				if (av.app.getActivePage() !== page) {
					av.router.pages[page].then((component) => {
						if (component.view !== av.types.UNDEFINED && component.viewUrl === av.types.UNDEFINED) {
							av.app.rootElement.innerHTML = component.view;
						} else if (component.view === av.types.UNDEFINED && component.viewUrl !== av.types.UNDEFINED) {
							av.router.loadPage(av.router.rootPath + 'src/' + component.viewUrl + '.sw.html')
								.then((data) => {
									av.app.rootElement.innerHTML = data;
								});
						} else {
							av.app.error('Could not find a view attached to ' + page, 'router');
						}

						document.title = component.title;

						av.app.rootElement.setAttribute('route', page);

						setTimeout(() => {
							component.init();
						}, 400);
					}).catch(() => {});
				}
			}
		},

		/**
		 * Load a page to the app.RootElement. Needs the absolute url to the HTML file.
		 * @param {string} page The page to load.
		 * @returns {Promise<string>}
		 */
		loadPage: async (page) => {
			try {
				const res = await fetch(page);
				return await res.text();
			}
			catch (err) {
				av.app.error(err, 'router');
			}
		},

		/**
		 * Create and register a module/page to link it with its corresponding route.
		 * @param {string} routeName The corresponding route registered in the router
		 * @param {string} title The title of the page
		 * @param {string} view The html content of the page
		 * @param {string} viewUrl URL of the html content of the page
		 * @param {() => void} onInit Runs when the page has been completely initialised
		 * @param ModuleCode The functions and backend operations related to this page
		 * @returns {Promise<void>}
		 */
		addPage: async (routeName, title, view, viewUrl, onInit, ModuleCode) => {
			const component = new Promise((resolve, reject) => {
				let rObj = {
					title: title,
					view: view,
					viewUrl: viewUrl,
					init: onInit,
					ModuleCode: ModuleCode,
				}
				av.router.loadPage(av.router.rootPath + 'src/' + rObj.viewUrl + '.sw.html')
				.then(data => {
					rObj['_avLoadedView'] = data;
					resolve(rObj);
				}).catch(err => {
					reject(err);
				});
			});
			av.router.pages[routeName] = component;
			return component;
		},
	},

	/**
	 * The App class. Meant for the ease of creating an app settings.
	 */
	App: class {
		/**
		 * 
		 * @param {{}} routes 
		 * @param {{}} appPreferences 
		 */
		title;
		appPreferences;
		constructor(routes, appPreferences) {
			this.pages = routes;
			this.appPreferences = appPreferences;
		}
	},

	createPage: (moduleClass, routeName) => {
		const ModuleClass = new (moduleClass)();
		av.router.addPage(routeName, ModuleClass.title, ModuleClass.view || av.types.UNDEFINED,
			ModuleClass.viewUrl || av.types.UNDEFINED, ModuleClass.onInit, ModuleClass)
		.then(() => {});
	},

	/**
	 * The app Object.
	 * The main interface for the user to act with for managing the app and logging.
	 */
	app: {
		/**
		 * Initialize the ***av*** app's DOM view.
		 * 
		 * @param {av.App} app The app object.
		 */
		init: (app) => {
			window.app = app;

			av.router.pages = app.pages;

			av.router.start(app).then(() => {
				av.elements.get('loader').classList.remove('av-visible');
				av.elements.get('loader').classList.add('av-nodisplay');

				console.log('Loading...');
				console.log('Welcome to A Visual 0.0.5');

				av.app.log('Loading components...');
				av.elements.ui.init();

				document.title = app.title;

				if (app.appPreferences !== undefined && app.appPreferences.icon !== undefined) {
					const faviconRef = av.elements.create('link', document.head, null, false);
					faviconRef.setAttribute('href', app.appPreferences.icon);
					faviconRef.setAttribute('rel', 'icon');
				}

				document.body.setAttribute('lang', 'en');
				document.body.setAttribute('dir', 'ltr');
				av.app.rootElement.classList.add('av-theme-' + av.app.rootElement.getAttribute('theme'));

				av.elements.ui.addStyleRefs('internal/framework/av.css');
				av.elements.ui.addStyleRefs('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');

				av.elements.ui.loadStyles(); 

				if (av.app.rootElement.getAttribute('theme') === 'dark') {
					const meta = av.elements.create('meta', document.head, null, false);
					meta.setAttribute('name', 'color-scheme');
					meta.setAttribute('content', 'dark');
				}

				window.onhashchange = () => {
					av.router.navigate(location.hash.substring(1).replace('/', ''));
				}
			});

			window.addEventListener('DOMContentLoaded', () => {
				if (av.elements.ui.stylesLoaded) {
					document.fonts.addEventListener('loadingdone', () => {
						console.log('Loaded Completely');
					});
				}
			});
		},

		/**
		 * The root element of the app. Inside this element, all UI functions occur.
		 * @type HTMLElement | Element
		 */
		rootElement: document.querySelector('av-app'),

		/**
		 * Log a message to the console.
		 * @param  {string} msg
		 */
		log: (msg) => {
			let colorStyleText = 'color:green;font-size:.8rem;font-weight:600';
			console.log('%c[app] ' + msg, colorStyleText);
		},

		errorScopes: { app: '[app]', router: '[ROUTER]', elements: '[ELEMENTS]', unknown: '[UNKNOWN]' },

		/**
		 * Throw an error.
		 * @param  {string} msg Error message.
		 * @param  {string} scope Scope of the error (possible values: `app`, `router`, `elements`,
		 * `unknown`)
		 */
		error: (msg, scope) => {
			const colorStyleText = 'color:red;font-size:.8rem;font-weight:600';
			const error = new Error('Internal app Error -> ' + av.app.errorScopes[scope] + ' ' + msg);

			if (app.appPreferences.verbose === 'high')
				console.error(`%c${error.stack}`, colorStyleText);
			if (app.appPreferences.verbose === 'medium')
				console.error(`%c${error.message}`, colorStyleText);
			if (app.appPreferences.verbose === 'low')
				console.error(`%c${msg}`, colorStyleText);
			console.table();
		},

		/**
		 * Get the currently routed-to page displayed in the `rootElement`.
		 */
		getActivePage: () => {
			return av.app.rootElement.getAttribute('route');
		},

	},

	elements: {

		ui: {
			/**
			 * Define all the A Visual UI elements.
			 */
			init: () => {
				customElements.define('av-button', av.elements.ui.Button);
				customElements.define('av-text', av.elements.ui.Text);
				customElements.define('av-container', av.elements.ui.Container);
				customElements.define('av-navbar', av.elements.ui.Navbar);
				customElements.define('av-link', av.elements.ui.Link);
				customElements.define('av-card', av.elements.ui.Card);
				customElements.define('av-modal', av.elements.ui.Modal);
				customElements.define('av-page', av.elements.ui.Page);
				customElements.define('av-span', av.elements.ui.Span);
				customElements.define('av-img', av.elements.ui.Img);
				customElements.define('av-input', av.elements.ui.Input);
				customElements.define('av-navtabs', av.elements.ui.Navtabs);
				customElements.define('av-list', av.elements.ui.List);
				customElements.define('av-dropdown', av.elements.ui.Dropdown);
			},

			/**
			 * The corresponding styles linked to the app to be loaded.
			 * @type Array<string>
			 */
			stylesToLoad: [],

			/**
			 * If the app has finished loading the styles.
			 * @type Boolean
			 */
			stylesLoaded: false,

			/**
			 * Add a CSS stylesheet reference to the `stylesToLoad` array.
			 * @param {string} href 
			 */
			addStyleRefs: (href) => {
				av.elements.ui.stylesToLoad.push(href);
			},

			/**
			 * Load all CSS stylesheets referenced to the application.
			 */
			loadStyles: () => {
				for (let i = 0; i < av.elements.ui.stylesToLoad.length; i++) {
					const e = av.elements.create('link', document.head, null, false);
					e.setAttribute('href', av.elements.ui.stylesToLoad[i]);
					e.setAttribute('rel', 'stylesheet');

					if (i === av.elements.ui.stylesToLoad.length - 1) {
						av.elements.ui.stylesLoaded = true;
					}
				}
			},

			/**
			 * Shows a little toast dialog at the right-bottom of the body. The toast has a
			 * title and a body message.
			 * 
			 * @param {string} title Title of the toast.
			 * @param {string} message Message shown in the body of the toast.
			 */
			showQuickToast: (title, message) => {
				const e = av.elements.create('av-toast', document.body, '', false);
				e.classList.add('av-toast', 'show');

				const head = av.elements.create('av-toast-head', e, '', false);
				head.classList.add('av-toast-head');
				av.elements.create('av-toast-title', head, title, false)
					.classList.add('av-toast-title');
				const body = av.elements.create('av-toast-body', e, message, false);
				body.classList.add('av-toast-body');

				setTimeout(() => {
					e.remove();
				}, 5000);
			},

			/**
			 * Very similar to toast. Shows a box with some info at left-bottom of the page.
			 * 
			 * @param  {string} infomsg The message shown in the info.
			 */
			showQuickInfo: (infomsg) => {
				if (document.querySelector('av-info'))
					document.querySelector('av-info').remove();

				const e = av.elements.create('av-info', document.body, infomsg, false);
				e.classList.add('av-info');
				e.classList.add('show');
				e.classList.add('align-bottom');

				setTimeout(() => {
					e.remove();
				}, 1500);
			},

			/**
			 * Other UI Definitions
			 */


			/**
			 * 
			 * Class implementations for av's UI objects.
			 * 
			 */

			/**
			 * Define simple text with a few tweaks.
			 */
			Text: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('av-text');

					if (this.hasAttribute('paragraph')) {
						this.classList.add('av-paragraph');
					}

					if (this.hasAttribute('jumbotron')) {
						this.classList.add('av-jumbo-text');
					}

					if (this.hasAttribute('color')) {
						this.classList.add('av-text-' + this.getAttribute('color'));
						this.removeAttribute('color');
					} else {
						this.classList.add('av-text-default');
					}

					if (this.hasAttribute('fw')) {
						this.classList.add('av-fontweight-' + this.getAttribute('fw') + '00');
					}
				}
			},

			/**
			 * Define a button with color, outline and a route inside the app to load.
			 */
			Button: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('av-button');
					this.classList.add('av-mat-item');

					this.classList.add('av-color-' + this.getAttribute('color'));
					this.removeAttribute('color');

					if (this.hasAttribute('outline') && !this.hasAttribute('color')) {
						this.classList.add('av-outline-color-' + this.getAttribute('outline'));
					}

					this.addEventListener('mousedown', () => {
						if (this.classList.contains('av-button-hovered')) {
							this.classList.remove('av-button-hovered');
						}
					});
					this.addEventListener('click', (e) => {
						if (this.hasAttribute('route')) {
							av.router.navigate(this.getAttribute('route'));
						}
						if (this.hasAttribute('*exec')) {
							const execute = new Function(`
							av.router.pages['${av.app.getActivePage()}'].then((c) => {
								c.ModuleCode.${this.getAttribute('*exec')};
							});
							`);
							execute();
						}
						if (this.hasAttribute('*download')) {
							const a = av.elements.create('a', document.body,
								null, false);
							a.href = this.getAttribute('*download');
							a.download = this.getAttribute('*download').split('/').pop();
							a.click();
							a.remove();
						}
						if (this.hasAttribute('ripple')) {
							let ripple = document.createElement('span');
							ripple.classList.add('ripple');
							this.appendChild(ripple);
							let x = e.clientX - e.target.offsetLeft;
							let y = e.clientY - e.target.offsetTop;
							ripple.style.left = `${x}px`;
							ripple.style.top = `${y}px`;
							setTimeout(() => {
								ripple.remove();
								x = null;
								y = null;
							}, 250);

						}
					});
				}
			},

			/**
			 * A link, basically associated with a text element.
			 */
			Link: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('av-link');

					if (this.hasAttribute('color')) {
						this.style.color = this.getAttribute('color');
					}

					let matAttr = this.getAttribute('mat');
					if (matAttr !== undefined || null) {
						if (matAttr !== 'none') {
							this.classList.add('av-mat-item');
						} else {
							this.classList.add('av-clickable');
						}
					}

					if (this.hasAttribute('navelement')) {
						this.classList.add('av-nav-element');
					}
					if (this.hasAttribute('navbrand')) {
						this.classList.add('av-nav-brand');
					}
					this.onclick = () => {
						if (this.hasAttribute('route')) {
							av.router.navigate(this.getAttribute('route'));
						}
						if (this.hasAttribute('href')) {
							window.open(this.getAttribute('href'), this.getAttribute('target'));
						}
						if (this.hasAttribute('*exec')) {
							const execute = new Function(`
							av.router.pages.${av.app.getActivePage()}.then(component => {
								new component().${this.getAttribute('*exec')};
							});
							`);
							execute();
						}
					}
				}
			},


			/**
			 * A simple container element, provided with some margin spacings.
			 */
			Container: class extends HTMLElement {
				constructor() {
					super();

					if (this.hasAttribute('small')) {
						this.classList.add('av-container-small');
					}
					else if (this.hasAttribute('card-deck')) {
						this.classList.add('av-card-deck');
					}
					else {
						this.classList.add('av-container');
					}

					if (this.hasAttribute('alignment')) {
						this.classList.add('align-' + this.getAttribute('alignment'));
					}

					if (this.hasAttribute('flex')) {
						this.style.display = 'flex';
						if (this.hasAttribute('flex-alignment')) {
							this.classList.add('av-flex-' + this.getAttribute('flex-alignment'));
						}
						this.removeAttribute('flex');
					}

					if (this.hasAttribute('parallax')) {
						if (this.getAttribute('parallax') === 'parent') {
							this.classList.add('av-parallax-parent');
							this.style.backgroundImage = 'url(' + this.getAttribute('parallax-image') + ')';
						}
						if (this.getAttribute('parallax') === 'child') {
							this.classList.add('av-container-transparent');
						}
					}

					if (this.hasAttribute('jumbotron-wrapper')) {
						this.classList.add('av-jumbotron-wrapper');
					}
				}
			},


			/**
			 * Creates a navbar with customizable colors. Also can be a fixed-top navbar.
			 */
			Navbar: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('av-nav');
					this.classList.add('av-color-' + this.getAttribute('color'));

					if (this.hasAttribute('fixed')) {
						this.classList.add('av-nav-fixed');
						av.app.rootElement.classList.add('av-body-fixednav-pads');
					}

					const e = av.elements.create('av-button-unused', this.querySelector('av-navbar-body'), '', false);
					e.classList.add('av-mobile-nav-toggle', 'av-mat-item');

					e.onclick = () => {
						this.querySelector('av-nav-list').toggleAttribute('navVisible');
					};
					this.querySelector('av-nav-list').querySelectorAll('[navElement]').forEach(element => {
						element.addEventListener('click', () => {
							this.querySelector('av-nav-list').toggleAttribute('navVisible');
						});
					});

					this.classList.add('av-nav-mobile');
					this.querySelector('av-navbar-body').classList.add('av-nav-body');
					this.querySelector('av-nav-list').classList.add('av-nav-list');
					this.querySelectorAll('av-nav-item').forEach(navItem => {
						navItem.classList.add('av-nav-item');
					});

					if (this.hasAttribute('fadeTo')) {
						const checkScroll = () => {
							this.classList.add('av-nav-fade');
							if (document.scrollingElement.scrollTop < 60) {
								this.classList.add('av-color-' + this.getAttribute('fadeTo'));
								this.classList.remove('av-color-' + this.getAttribute('color'));
							} else {
								this.classList.remove('av-color-' + this.getAttribute('fadeTo'));
								this.classList.add('av-color-' + this.getAttribute('color'));
							}
						}

						checkScroll();
						document.addEventListener('scroll', () => {
							checkScroll();
						});
					}

					this.removeAttribute('fixed');
				}
			},

			/**
			 * A classic Card element.
			 */
			Card: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('av-card');

					this.querySelector('av-card-head').classList.add('av-card-head');
					this.querySelector('av-card-body').classList.add('av-card-body');

					this.querySelector('av-card-title').classList.add('av-card-title');

					if (this.hasAttribute('no-shadow')) {
						this.classList.add('av-card-noshadow');
					}
				}
			},

			/**
			 * A Modal.
			 */
			Modal: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('av-modal');
					this.classList.add('av-modal-hidden');

					this.querySelector('av-modal-body').classList.add('av-modal-body');
					const wrapper = this.querySelector('av-modal-close');
					wrapper.classList.add('av-modal-close-wrapper');

					av.elements.create('av-modal-close-button', wrapper, '&nbsp;&Cross;&nbsp;', false)
						.classList.add('av-modal-close');

					this.querySelectorAll('[modal-close]').forEach(closer => {
						closer.addEventListener('click', () => {
							av.elements.disable(av.elements.get(`${this.getAttribute('name')}`), true);
						});
					});


					this.querySelector('av-modal-title').classList.add('av-modal-title');

					this.querySelector('av-modal-buttons').classList.add('av-modal-buttons');
				}
			},

			/**
			 * Insert an iframe-like page into the document (not an iframe).
			 */
			Page: class extends HTMLElement {
				constructor() {
					super();

					av.router.pages[this.getAttribute('route')].then((page) => {
						console.log(page);
						this.loadInner(page);
					});
				}
				async loadInner(page) {
					this.innerHTML = page._avLoadedView;
				}
			},

			/**
			 * A plain element. If you just want a simple element on which you can toggle
			 * visibility, use this one!
			 */
			Span: class extends HTMLElement {
				constructor() {
					super();

					const _this = this;

					if (this.hasAttribute('sw-visible')) {

						const checkFunc = new Function('return(' + this.getAttribute('sw-visible') + ');');

						if (checkFunc() === true) {
							this.style.display = '';
						} else {
							this.style.display = 'none';
						}
						var observer = new MutationObserver(function (mutations) {
							mutations.forEach(function (mutation) {
								if (mutation.type === 'attributes') {
									const checkFunc = new Function('return(' + _this.getAttribute('sw-visible') + ');');
									if (checkFunc() === true) {
										_this.style.display = '';
									} else {
										_this.style.display = 'none';
									}
								}
							});
						});

						observer.observe(this, {
							attributes: true,
						});
					}

					if (this.hasAttribute('sw-if')) {

						const checkFunc = new Function('return(' + this.getAttribute('sw-if') + ');');

						if (checkFunc() === true) {
							this.style.display = '';
						} else {
							this.style.display = 'none';
						}
						var observer = new MutationObserver(function (mutations) {
							mutations.forEach(function (mutation) {
								if (mutation.type === 'attributes') {
									if (new Boolean(_this.getAttribute('sw-if'))) {
										_this.style.display = '';
									} else {
										_this.style.display = 'none';
									}
								}
							});
						});

						observer.observe(this, {
							attributes: true,
						});
					}
				}
			},

			/**
			 * An image. The difference between this and a normal image? This also provides a 
			 * loading spinner until the complete image is loaded, also with no-effort padding
			 * and size.
			 */
			Img: class extends HTMLElement {
				constructor() {
					super();

					let childImg;

					this.classList.add('av-img');

					const spinner = av.elements.create('span', this, null, false);
					spinner.classList.add('av-spinner');

					if (this.hasAttribute('src')) {
						childImg = av.elements.create('img', this, null, false);
						childImg.setAttribute('src', this.getAttribute('src'));
						childImg.setAttribute('alt', this.getAttribute('alt'));

						childImg.onload = () => {
							spinner.remove();
						}

						this.removeAttribute('src');
						this.removeAttribute('alt');
					}

					if (this.hasAttribute('size')) {
						childImg.style.width = this.getAttribute('size');
						this.removeAttribute('size');
					}

					if (this.hasAttribute('pads')) {
						childImg.style.padding = this.getAttribute('pads');
						this.removeAttribute('pads');
					}

					if (this.hasAttribute('drag')) {
						if (this.getAttribute('drag') === 'false')
							childImg.classList.add('av-img-nodrag');
						this.removeAttribute('drag');
					}

					if (this.hasAttribute('parallax')) {
						this.style.backgroundAttachment = 'fixed';
						this.style.backgroundPosition = 'center';
						this.style.backgroundRepeat = 'no-repeat';
						this.style.backgroundSize = 'cover';
					}

					if (this.hasAttribute('childProps')) {
						let props = new Object(JSON.parse(this.getAttribute('childProps')));
						for (let i = 0; i < Object.keys(props).length; i++) {
							childImg.setAttribute(Object.keys(props)[i], Object.values(props)[i]);
						}
						this.removeAttribute('childProps');
					}

					if (this.getAttribute('hoverable') === 'true') {
						childImg.classList.add('av-img-hoverable');
						this.removeAttribute('hoverable');
					}
				}
			},

			/**
			 * An input element with responsive and reactive change detection.
			 */
			Input: class extends HTMLElement {
				constructor() {
					super();

					const childInput = av.elements.create('input', this, null, false);
					childInput.classList.add('av-input');
					if (this.hasAttribute('hint')) {
						childInput.setAttribute('placeholder', this.getAttribute('hint'));
						this.removeAttribute('hint');
					}
					if (this.hasAttribute('name')) {
						childInput.setAttribute('name', this.getAttribute('name'));
					}
					if (this.hasAttribute('type')) {
						if (this.getAttribute('type') === 'file') {
							childInput.classList.add('av-button', 'av-color-primary');
							const e = av.elements.create('av-button-unused', this, 'Choose file', false);
							e.classList.add('av-button', 'av-mat-item', 'av-color-primary');
							e.onclick = () => {
								childInput.click();
							}
						}
						childInput.setAttribute('type', this.getAttribute('type'));
					}

					if (this.hasAttribute('childProps')) {
						let props = new Object(JSON.parse(this.getAttribute('childProps')));
						for (let i = 0; i < Object.keys(props).length; i++) {
							childInput.setAttribute(Object.keys(props)[i], Object.values(props)[i]);
						}
						this.removeAttribute('childProps');
					}

					if (this.hasAttribute('*change')) {
						av.router.pages[av.app.getActivePage()].then(c => {
							let component = c;
							if (this.getAttribute('type') === 'file') {
								this.addEventListener('change', (event) => {
									const fr = new FileReader();
									fr.onload = (event) => {
										const fn = new Function(`av.router.pages.${av.app.getActivePage()}.then((p) => {
										p.ModuleCode.${this.getAttribute('*change')}(\`${encodeURI(event.target.result)}\`);
										})`);
										fn();
									};
									fr.readAsText(event.target.files[0]);
								});
							} else {
								this.addEventListener('input', () => {
									const fn = new Function(`let component = ${c.toString()};new component().${this.getAttribute('*change')}();`);
									fn();
								});
							}
						});
					}
				}
			},

			/**
			 * Similar to Navbar, but simpler and tabs aren't different pages but only elements
			 * which have different content.
			 */
			Navtabs: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('av-navtabs');
					this.classList.add('av-navtabs-tabs');

					this.querySelectorAll('av-navtabs-item').forEach((tab) => {
						tab.classList.add('av-navtabs-item');
						tab.classList.add('av-mat-item');

						tab.addEventListener('click', () => {
							av.elements.changeActiveTab(this, tab.getAttribute('name'));
							if (this.hasAttribute('*change')) {
								const fn = new Function(`
									av.router.pages.${av.app.getActivePage()}.then((component) => {
										const activeTab = Slm.getActiveTab(Slm.get('${this.getAttribute('name')}'));
										component.ModuleCode.${this.getAttribute('*change')}(activeTab.getAttribute('name'));
									});
								`);
								fn();
							}
						});
					});

					document.querySelectorAll('av-navtabs-content').forEach(tabContents => {
						tabContents.classList.add('av-navtabs-content');
					});

					av.elements.changeActiveTab(this, this.children[0].getAttribute('name'));
				}
			},

			/**
			 * A list element.
			 */
			List: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('av-list', 'av-container-small');

					this.querySelectorAll('av-list-item').forEach(items => {
						items.classList.add('av-list-item');
					});
				}
			},

			Dropdown: class extends HTMLElement {
				constructor() {
					super();

					let childSelect;

					if (this.hasAttribute('type')) {
						if (this.getAttribute('type') === 'btn') {
							const childBtn = av.elements.create('av-button-unused', this, this.querySelector('av-dropdown-title').innerHTML, false);
							childBtn.classList.add('av-button', 'av-color-primary', 'av-mat-item');
							this.querySelector('av-dropdown-title').remove();
							this.querySelector('av-dropdown-content').classList.add('av-dropdown-content');

							childBtn.addEventListener('click', () => {
								this.querySelector('av-dropdown-content').toggleAttribute('dropcontent-visible');
							});

							this.querySelectorAll('[dropdown-item]').forEach(dropItem => {
								dropItem.classList.remove();
								dropItem.classList.add('av-dropdown-item');

								dropItem.addEventListener('click', () => {
									this.querySelector('av-dropdown-content').toggleAttribute('dropcontent-visible');
								});
							});
						} else if (this.getAttribute('type') === 'select') {
							childSelect = av.elements.create('select', this, this.innerHTML, true);
							childSelect.classList.add('av-dropdown');

							if (this.hasAttribute('*change')) {
								childSelect.addEventListener('change', (event) => {
									const fn = new Function(`
									av.router.pages.${av.app.getActivePage()}.then((page) => {
										page.ModuleCode.${this.getAttribute('*change')}(\`${event.target.value}\`);
									});
								`);
									fn();
								});
							}
						}
					}
				}
			}

		},


		/**
		 * Create/append a new element in the DOM Body.
		 * @param {string} name The tag name of the element.
		 * @param {HTMLElement} parent The parent element to this element.
		 * @param {string} contents The HTML contents of the given element.
		 * @param {Boolean} emptyParent If the parent's text should be emptied while appending
		 * 
		 * @returns {HTMLElement}
		 */
		create: (name, parent, contents, emptyParent) => {
			const e = document.createElement(name);

			e.innerHTML = contents;
			if (emptyParent) {
				parent.innerText = '';
			}

			parent.append(e);

			return e;
		},

		/**
		 * Enables an element.
		 * 
		 * @param  {HTMLElement} element The element.
		 * @param  {Boolean} isModal If the element is a Modal Component.
		 */
		enable: (element, isModal) => {
			if (isModal) {
				element.classList.add('av-modal-shown');
				element.classList.remove('av-modal-hidden');
			} else {
				element.classList.remove('av-nodisplay');
				element.classList.add('av-visible');
			}
		},

		/**
		 * Disables an element.
		 * 
		 * @param  {HTMLElement} element The element.
		 * @param  {Boolean} isModal If the element is a Modal Component.
		 */
		disable: (element, isModal) => {
			if (isModal) {
				element.classList.remove('av-modal-shown');
				element.classList.add('av-modal-start-hide');
				setTimeout(() => {
					element.classList.remove('av-modal-start-hide');
					element.classList.add('av-modal-hidden');
				}, 550);
			} else {
				element.classList.add('av-nodisplay');
				if (element.classList.contains('av-visible')) {
					element.classList.remove('av-visible');
				}
			}
		},

		/**
		 * Append text/html data to an element.
		 * 
		 * @param  {HTMLElement} element The parent element of the data.
		 * @param  {string} data The data to fill.
		 * @param  {boolean} clearOld Should clear the old data in the parent element before filling.
		 * @param  {HTMLInputElement} fromInput 
		 */
		fill: (element, data, clearOld, fromInput) => {
			let innerFill;
			if (!clearOld) {
				if (fromInput !== null) {
					innerFill = element.innerHTML + fromInput.children[0].value;
				} else {
					innerFill = element.innerHTML + data;
				}
			} else {
				if (fromInput !== null) {
					innerFill = fromInput.children[0].value;
				} else {
					innerFill = data;
				}
			}

			element.innerHTML = innerFill;
		},

		/**
		 * Get the HTMLElement by its selector.
		 * 
		 * @param  {string} name name.
		 * @returns {HTMLElement}
		 */
		get: (name) => {
			return document.getElementsByName(name)[0];
		},

		/**
		 * Activate a particular tab in a Navtabs group.
		 * @param  {HTMLElement} tabs The navtabs group.
		 * @param  {string} activate The name of the tab to activate.
		 */
		changeActiveTab: (tabs, activate) => {
			tabs.querySelectorAll('av-navtabs-item').forEach((tab) => {
				if (tab.hasAttribute('active')) {
					tab.removeAttribute('active');
				}
			});
			tabs.querySelector(`[name=${activate}]`).setAttribute('active', '');

			const contentSelector = 'content_' + activate;
			document.querySelectorAll('av-navtabs-content').forEach((tabContents) => {
				tabContents.classList.add('av-navtabs-content');

				tabContents.classList.remove('av-visible');
				tabContents.classList.add('av-nodisplay');
				if (tabContents.getAttribute('group') === tabs.getAttribute('name')
					&& tabContents.getAttribute('name') === contentSelector) {
					tabContents.classList.remove('av-nodisplay');
					tabContents.classList.add('av-visible');
				}
			});
		},

		/**
		 * Get the currently open tab in a navtabs group.
		 * @param {HTMLElement} tabs The navtabs group.
		 * @returns {HTMLElement}
		 */
		getActiveTab: (tabs) => {
			return tabs.querySelector('[active]');
		},
	},
	math: {
		factorial: (n) => {
			for (let i = n-1; i > 0; i--) {
				n = n * i;
			}
			return n;
		},
	}
};

const Sui = av.elements.ui;
const Slm = av.elements;
const Spg = av.plugins;

const $component = av.loadComponent;
const $element = av.elements.get;
/**
 * Thanks for peeking into the wonderous code of av :)
 */