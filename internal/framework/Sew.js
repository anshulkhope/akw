/**
 * Sew v0.0.4
 * Copyright (c) 2021 - Anshul Khope, Sew Company
 * 
 * Sew is JavaScript library for easier handling of UI Components.
 * It is completely based on the idea of Components. Everything you see is a component;
 * even the app itself.
 * 
 * Components can be decorated differently to get results such as buttons,
 * checkboxes, text inputs, links, cards, paragraphs, navbar, etc. Sew comes by default
 * with a CSS that you can use right away (no link-imports needed, the library
 * imports it by default!).
 * 
 * :PS, You can even make the library import a custom stylesheet.
 * 
 * In short:
 * Sew = Making WebGUIs easier!
 * 
 */


/** 
 * The main ***Sew*** Object. Contains sub-classes for UI-elements, router and
 * other functions.
 */

const sew = {

	/**
	 * @name addStyleRefs
	 * @description Add a reference to a CSS stylesheet.
	 * 
	 * @param  {String} href The URL/path to the stylesheet.
	 */
	addStyleRefs: (href) => {
		const e = sew.elements.create('link', document.head, null, false);
		e.setAttribute('href', href);
		e.setAttribute('rel', 'stylesheet');

		e.onload = () => {
			console.log('Loaded Styles! [' + href + ']');
		}
	},

	/**
	 * @name showQuickToast
	 * @description Shows a little toast dialog at the right-bottom of the body. The toast has a
	 * title and a body message.
	 * 
	 * @param  {String} title Title of the toast.
	 * @param  {String} message Message shown in the body of the toast.
	 */
	showQuickToast: (title, message) => {
		const e = sew.elements.create('sew-toast', document.body, '', false);
		e.classList.add('sew-toast');
		e.classList.add('show');


		const head = sew.elements.create('sew-toast-head', e, '', false);
		head.classList.add('sew-toast-head');
		sew.elements.create('sew-toast-title', head, title, false)
			.classList.add('sew-toast-title');
		const body = sew.elements.create('sew-toast-body', e, message, false);
		body.classList.add('sew-toast-body');


		setTimeout(() => {
			e.remove();
		}, 3000);
	},
	/**
	 * @name showQuickInfo
	 * @description Very similar to toast. Shows a box with some info at left-bottom of the page.
	 * Especially links of sew-Link components.
	 * 
	 * @param  {String} infomsg The message shown in the info.
	 */
	showQuickInfo: (infomsg) => {

		if (document.querySelector('sew-info'))
			document.querySelector('sew-info').remove();

		const e = sew.elements.create('sew-info', document.body, infomsg, false);
		e.classList.add('sew-info');
		e.classList.add('show');
		e.classList.add('align-bottom');

		setTimeout(() => {
			e.remove();
		}, 1500);
	},

	/**
	 * Loads a component class.
	 * @param  {String} component The path to the component (`*.page.js`)
	 * @returns `Promise<string>`
	 */
	loadComponent: async (component) => {
		const res = await fetch('src/' + component);
		const componentClass = res.text();
		return (new Function((await componentClass).toString() + 'return _swComponent;'))();
	},

	getFileData: (data) => {
		return decodeURI(data);
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
		shouldDisablecontrols: true,

		/**
		 * Disable a particular control (`inspect`, `contextmenu` , `view-source`, `select`)
		 * @param {String} control The control to disable.
		 * @param {String} msgOnCtrlBreak **TODO** 
		 */
		disable: (control, msgOnCtrlBreak) => {

			if (control === 'inspect' && sew.controls.shouldDisablecontrols) {
				document.onkeydown = (e) => {
					if (e.keyCode == 123) {
						sew.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
					if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
						sew.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
					if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
						sew.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
					if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
						sew.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
				}
			}
			else if (control === 'view-source' && sew.controls.shouldDisablecontrols) {
				document.onkeydown = (e) => {
					if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
						sew.showQuickToast('Error', 'View Source is disabled.');
						return false;
					}
				}
			}
			if (control === 'contextmenu' && sew.controls.shouldDisablecontrols) {
				document.oncontextmenu = function (e) {
					sew.showQuickToast('Error', 'Right Click is disabled.');
					return false;
				}
			}
			if (control === 'select' && sew.controls.shouldDisablecontrols) {
				document.onselectstart = (ev) => {
					ev.preventDefault();
				}
				sew.app.rootElement.classList.add('sew-cursor-default');
				return false;
			}
		}
	},

	/**
	 * The router. Handles routing for all paths defined by user.
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
		 * The root or base path from which the routes/routing would work.
		 * @type String
		 * @default '/'
		 */
		rootPath: '/',

		/**
		 * Start the router. Also loads all pages asynchronously to provide blazing fast output.
		 */
		start: async (app) => {

			sew.router.rootPath = document.querySelector('base').href;
			 
			Object.values(app.pages).forEach(page => {
				sew.router.pages[page.name] = page.view;
			});
			
			sew.app.rootElement.setAttribute('route', 'default');
			sew.router.loading = false;

			if (location.hash !== '') {
				sew.router.navigate(location.hash.substring(1).replace('/', ''));
			} else {
				sew.router.navigate(Object.keys(app.pages)[0]);
			}
		},

		/**
		 * Navigate to a page.
		 * @param {String} page The page name.
		 */
		navigate: async (page) => {
			if (sew.router.pages[page] === undefined | null) {
				sew.app.error('Unknown Error', 'router');
				
				const pauseBlank = sew.elements.create('sew-overlay', document.body,
					'<sew-container alignment=center><h1>Unknown Error!</h1></sew-container>', false);
				pauseBlank.classList.add('sew-overlay');
			} else {
				await sew.router.pages[page].then((componentClass) => {
					let component = new componentClass();
	
					location.hash = '#/' + page;
	
					if (component.view !== undefined && component.viewUrl === undefined) {
						sew.app.rootElement.innerHTML = component.view;
					} else if (component.view === undefined && component.viewUrl !== undefined) {
						sew.router.loadPage(sew.router.rootPath + 'src/' + component.viewUrl + '.sw.html')
							.then((data) => {
								sew.app.rootElement.innerHTML = data;
							});
					} else {
						sew.app.error('Could not find a view attached to ' + page, 'router');
					}
					
					document.title = component.title;
					
					sew.app.rootElement.setAttribute('route', page);
					
					component.init();
				}).catch((error) => {
					if (error) {
						sew.app.error(error, 'router');
					}
				});
			}
		},

		/**
		 * Load a page to the app.RootElement. Needs the absolute url to the HTML file.
		 * @param {String} page The page to load.
		 * @returns String
		 */
		loadPage: async (page) => {
			const res = await fetch(page);
			const html = await res.text();
			return html;
		},
	},

	/**
	 * The app Class.
	 * Contains a few related functions and variables to the router and the app.
	 */
	app: {
		/**
		 * Initialize the ***Sew*** app's DOM view.
		 * 
		 * @param  {{pages: {}, appPreferences?: {}}} app The app object.
		 */
		init: (app) => {

			sew.router.pages = app.pages;

			sew.router.start(app).then(() => {
				console.log('Loading...');
				console.log('Welcome to Sew 0.0.4');
	
				sew.app.log('Loading components...');
				Sui.init();

				document.title = app.title;

				if (app.appPreferences !== undefined && app.appPreferences.icon !== undefined) {
					const faviconRef = sew.elements.create('link', document.head, null, false);
					faviconRef.setAttribute('href', app.appPreferences.icon);
					faviconRef.setAttribute('rel', 'icon');
				}

				document.body.setAttribute('lang', 'en');
				document.body.setAttribute('dir', 'ltr');
				sew.app.rootElement.classList.add('sew-theme-' + sew.app.rootElement.getAttribute('theme'));

				sew.addStyleRefs('internal/framework/Sew.css');

				if (sew.app.rootElement.getAttribute('theme') === 'dark') {
					const meta = sew.elements.create('meta', document.head, null, false);
					meta.setAttribute('name', 'color-scheme');
					meta.setAttribute('content', 'dark');
				}

				window.onhashchange = () => {
					sew.router.navigate(location.hash.substring(1).replace('/', ''));
				}
			});
		},

		/**
		 * The app's root.
		 */
		rootElement: document.querySelector('sew-app'),

		/**
		 * Log a message to the console.
		 * @param  {String} msg 
		 */
		log: (msg) => {
			let colorStyleText = 'color:green;font-size:.8rem;font-weight:600';
			console.log('%c[app] ' + msg, colorStyleText);
		},

		errorScopes: { app: '[app]', router: '[ROUTER]', elements: '[ELEMENTS]', unknown: '[UNKNOWN]' },

		/**
		 * Throw an error.
		 * @param  {String} msg Error message.
		 * @param  {String} scope Scope of the error (possible values: `app`, `router`, `elements`,
		 * `unknown`)
		 */
		error: (msg, scope) => {
			console.error(new Error('Internal app Error -> ' + sew.app.errorScopes[scope] + ' ' + msg));
		},

		/**
		 * Get the currently routed-to page displayed in the `rootElement`.
		 */
		getActivePage: () => {
			return sew.app.rootElement.getAttribute('route');
		},

	},

	elements: {
	
		ui: {
			/**
			 * Define all the custom Sew UI elements.
			 */
			init: () => {
				customElements.define('sew-button', Sui.Button);
				customElements.define('sew-text', Sui.Text);
				customElements.define('sew-container', Sui.Container);
				customElements.define('sew-navbar', Sui.Navbar);
				customElements.define('sew-link', Sui.Link);
				customElements.define('sew-card', Sui.Card);
				customElements.define('sew-modal', Sui.Modal);
				customElements.define('sew-page', Sui.Page);
				customElements.define('sew-span', Sui.Span);
				customElements.define('sew-img', Sui.Img);
				customElements.define('sew-input', Sui.Input);
				customElements.define('sew-navtabs', Sui.Navtabs);
			},


			/**
			 * 
			 * Class implementations for Sew's UI objects.
			 * 
			 */

			/**
			 * Define simple text with a few tweaks.
			 */
			Text: class extends HTMLElement {
				constructor() {
					super();

					if (this.hasAttribute('paragraph')) {
						this.classList.add('sew-paragraph');
					}

					if (this.hasAttribute('jumbotron')) {
						this.classList.add('sew-jumbo-text');
					}

					if (this.hasAttribute('color')) {
						this.classList.add('sew-text-' + this.getAttribute('color'));
					} else {
						this.classList.add('sew-text-default');
					}
				}
			},

			/**
			 * Define a button with color, outline and a route inside the app to load.
			 */
			Button: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('sew-button');
					this.classList.add('sew-mat-item');

					this.classList.add('sew-color-' + this.getAttribute('color'));
					this.removeAttribute('color');

					if (this.hasAttribute('outline') && !this.hasAttribute('color')) {
						this.classList.add('sew-outline-color-' + this.getAttribute('outline'));
					}

					this.onmousedown = () => {
						if (this.classList.contains('sew-button-hovered')) {
							this.classList.remove('sew-button-hovered');
						}
					};
					this.onclick = (event) => {
						if (this.hasAttribute('route')) {
							sew.router.navigate(this.getAttribute('route'));
						}
						if (this.hasAttribute('*exec')) {
							const execute = new Function(`
							sew.router.pages.${sew.app.getActivePage()}.then(component => {
								new component().${this.getAttribute('*exec')};
							});
							`);
							execute();
						}
						if (this.hasAttribute('*download')) {
							const a = sew.elements.create('a', document.body,
								null, false);
							a.href = this.getAttribute('*download');
							a.download = this.getAttribute('*download').split('/').pop();
							a.click();
							a.remove();
						}
					}
				}
			},

			/**
			 * A link, basically associated with a text element.
			 */
			Link: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('sew-link');
					this.classList.add('sew-mat-item');
					
					if (this.hasAttribute('color')) {
						this.style.color = this.getAttribute('color');
					}
					
					if (this.hasAttribute('navelement')) {
						this.classList.add('sew-nav-element');
					}
					this.onclick = () => {
						if (this.hasAttribute('route')) {
							sew.router.navigate(this.getAttribute('route'));
						}
						if (this.hasAttribute('href')) {
							window.open(this.getAttribute('href'), this.getAttribute('target'));
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
						this.classList.add('sew-container-small');
					}
					else if (this.hasAttribute('card-deck')) {
						this.classList.add('sew-card-deck');
					}
					else {
						this.classList.add('sew-container');
					}

					if (this.hasAttribute('alignment')) {
						this.classList.add('align-' + this.getAttribute('alignment'));
					}

					if (this.hasAttribute('jumbotron-wrapper')) {
						this.classList.add('sew-jumbotron-wrapper');
					}
				}
			},


			/**
			 * Creates a navbar with customizable colors. Also can be a fixed-top navbar.
			 */
			Navbar: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('sew-nav');
					this.classList.add('sew-color-' + this.getAttribute('color'));

					if (this.hasAttribute('fixed')) {
						this.classList.add('sew-nav-fixed');
						sew.app.rootElement.classList.add('sew-body-fixednav-pads');
					}

					const e = sew.elements.create('sew-button-unused', this.querySelector('[navBody]'), '', false);
					e.classList.add('sew-button');
					e.classList.add('sew-color-danger');
					e.classList.add('sew-mat-item');
					e.classList.add('sew-mobile-nav-toggle');

					e.onclick = () => {
						this.querySelector('ul[navList]').toggleAttribute('navVisible');
					};

					this.classList.add('sew-nav-mobile');
				}
			},

			/**
			 * A classic Card element.
			 */
			Card: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('sew-card');

					this.querySelector('sew-card-head').classList.add('sew-card-head');
					this.querySelector('sew-card-body').classList.add('sew-card-body');

					this.querySelector('sew-card-title').classList.add('sew-card-title');
				}
			},

			/**
			 * A Modal.
			 */
			Modal: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('sew-modal');
					this.classList.add('sew-modal-hidden');

					this.querySelector('sew-modal-body').classList.add('sew-modal-body');
					const wrapper = this.querySelector('sew-modal-close');
					wrapper.classList.add('sew-modal-close-wrapper');

					sew.elements.create('sew-modal-close-button', wrapper, '&nbsp;&Cross;&nbsp;', false)
						.classList.add('sew-modal-close');

					if (this.querySelector('[modal-close]') !== null) {
						this.querySelector('[modal-close]').addEventListener('click', () => {
							sew.elements.disable(sew.elements.get(`${this.getAttribute('name')}`), true);
						});
					}


					this.querySelector('sew-modal-title').classList.add('sew-modal-title');

					this.querySelector('sew-modal-buttons').classList.add('sew-modal-buttons');

					this.querySelector('sew-modal-close-button').addEventListener('click', () => {
						sew.elements.disable(sew.elements.get(`${this.name}`), true);
					});
				}
			},

			/**
			 * Insert an iframe-like page into the document (not an iframe).
			 */
			Page: class extends HTMLElement {
				constructor() {
					super();

					this.loadInner();
				}
				async loadInner() {
					await sew.router.pages[this.getAttribute('route')].then(c => {
						let component = new c();

						sew.router.loadPage(sew.router.rootPath + 'src/' + component.viewUrl + '.sw.html')
							.then((data) => {
								this.innerHTML = data;
							});
					});
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
						var observer = new MutationObserver(function(mutations) {
							mutations.forEach(function(mutation) {
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
						var observer = new MutationObserver(function(mutations) {
							mutations.forEach(function(mutation) {
							if (mutation.type === 'attributes') {
								const checkFunc = new Function('return(' + _this.getAttribute('sw-if') + ');');
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

					this.classList.add('sew-img');
					
					const spinner = sew.elements.create('span', this, null, false);
					spinner.classList.add('sew-spinner');
					
					if (this.hasAttribute('src')) {
						childImg = sew.elements.create('img', this, null, false);
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
							childImg.classList.add('sew-img-nodrag');
						this.removeAttribute('drag');
					}

					if (this.hasAttribute('sw-class')) {
						childImg.classList.add(this.getAttribute('sw-class'));
						this.removeAttribute('sw-class');
					}
				}
			},

			/**
			 * An input element with responsive and reactive change detection.
			 */
			Input: class extends HTMLElement {
				constructor() {
					super();

					const childInput = sew.elements.create('input', this, null, false);
					if (this.hasAttribute('hint')) {
						childInput.setAttribute('placeholder', this.getAttribute('hint'));
						this.removeAttribute('hint');
					}
					if (this.hasAttribute('name')) {
						childInput.setAttribute('name', this.getAttribute('name'));
					}
					if (this.hasAttribute('type')) {
						if (this.getAttribute('type') === 'file') {
							childInput.classList.add('sew-button', 'sew-color-primary');
							const e=sew.elements.create('sew-button-unused', this, 'Choose file', false);
							e.classList.add('sew-button', 'sew-mat-item', 'sew-color-primary');
							e.onclick = () => {
								childInput.click();	
							}
						}
						childInput.setAttribute('type', this.getAttribute('type'));
					}

					if (this.hasAttribute('*change')) {
						sew.router.pages[sew.app.getActivePage()].then(c => {
							let component = new c();
							if (this.getAttribute('type') === 'file') {
								this.addEventListener('change', (event) => {
									const fr = new FileReader();
									fr.onload = (event) => {
										const fn = new Function(`let component = ${c.toString()};new component().${this.getAttribute('*change')}(\`${encodeURI(event.target.result)}\`);`);
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

					this.classList.add('sew-navtabs');
					this.classList.add('sew-navtabs-tabs');

					this.querySelectorAll('sew-navtabs-item').forEach((tab) => {
						tab.classList.add('sew-navtabs-item');
						tab.classList.add('sew-mat-item');

						tab.addEventListener('click', () => {
							sew.elements.changeActiveTab(this, tab.getAttribute('name'));
							if (this.hasAttribute('*change')) {
								const fn = new Function(`
									sew.router.pages.${sew.app.getActivePage()}.then((component) => {
										const activeTab = Slm.getActiveTab(Slm.get('${this.getAttribute('name')}'));
										new component().${this.getAttribute('*change')}(activeTab.getAttribute('name'));
									});
								`);
								fn();
							}
						});
					});

					document.querySelectorAll('sew-navtabs-content').forEach(tabContents => { 
						tabContents.classList.add('sew-navtabs-content');
					});

					sew.elements.changeActiveTab(this, this.children[0].getAttribute('name'));
				}
			}
		},

		
		/**
		 * Create/append a new element in the DOM Body.
		 * 
		 * @param  {String} name The tag name of the element.
		 * @param  {HTMLElement} parent The parent element to this element.
		 * @param  {String} contents The HTML contents of the given element.
		 * @param  {Boolean} emptyParent If the parent's text should be emptied while appending
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
				element.classList.add('sew-modal-shown');
				element.classList.remove('sew-modal-hidden');
			} else {
				element.classList.remove('sew-nodisplay');
				element.classList.add('sew-visible');
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
				element.classList.remove('sew-modal-shown');
				element.classList.add('sew-modal-start-hide');
				setTimeout(() => {
					element.classList.remove('sew-modal-start-hide');
					element.classList.add('sew-modal-hidden');
				}, 550);
			} else {
				element.classList.add('sew-nodisplay');
				if (element.classList.contains('sew-visible')) {
					element.classList.remove('sew-visible');
				}
			}
		},

		/**
		 * Append text/html data to an element.
		 * 
		 * @param  {HTMLElement} element The parent element of the data.
		 * @param  {String} data The data to fill.
		 * @param  {boolean} clearOld Should clear the old data in the parent element before filling.
		 * @param  {HTMLInputElement} fromInput 
		 */
		fill: (element, data, clearOld, fromInput) => {
			let innerFill;
			if (!clearOld) {
				if (fromInput !== null) {
					const oldInnerHtml = element.innerHTML;
					innerFill = oldInnerHtml + fromInput.children[0].value;
				} else {
					const oldInnerHtml = element.innerHTML;
					innerFill = oldInnerHtml + data;
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
		 * @param  {String} name name.
		 */
		get: (name) => {
			return document.getElementsByName(name)[0];
		},

		/**
		 * Activate a particular tab in a Navtabs group.
		 * @param {HTMLElement} tabs The navtabs group.
		 * @param {String} activate The name of the tab to activate.
		 */
		changeActiveTab: (tabs, activate) => {
			tabs.querySelectorAll('sew-navtabs-item').forEach((tab) => {
				if (tab.hasAttribute('active')) {
					tab.removeAttribute('active');
				}
			});
			tabs.querySelector(`[name=${activate}]`).setAttribute('active', '');

			const contentSelector = 'content_' + activate;
			document.querySelectorAll('sew-navtabs-content').forEach((tabContents) => {
				tabContents.classList.add('sew-navtabs-content');

				tabContents.classList.remove('sew-visible');
				tabContents.classList.add('sew-nodisplay');
				if (tabContents.getAttribute('group') === tabs.getAttribute('name')
				 && tabContents.getAttribute('name') === contentSelector) {
					 tabContents.classList.remove('sew-nodisplay');
					 tabContents.classList.add('sew-visible');
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

	plugins: {
		User: {

			login: () => {
				window.globalSwContext = {};
				window.globalSwContext.userTok = Spg.User.token().get(35);
				console.log('Signing User...', window.globalSwContext.userTok);
			},
			register: () => {},
			update: () => {},
			token: () => {
				return {
					get(randLength=5){var str='';var randChar=(function(){var n=Math.floor(Math.random()*62);
						if(n<10)return(n);if(n<36)return(String.fromCharCode(n+55));return(String.fromCharCode(n+61));});while
						(str.length < randLength)str+=randChar();return(str);}
				} 
					
			},
		},
	},
};

const Sui = sew.elements.ui;
const Slm = sew.elements;
const Spg = sew.plugins;

/**
 * Thanks for peeking into the wonderous code of Sew :)
 */
