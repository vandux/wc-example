class ArticleContent extends HTMLElement {
  static get observedAttributes() {
    return ['uuid', 'locale', 'visitor-id'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'uuid' || name === 'locale') {
      this.loadArticle();
    }
  }

  connectedCallback() {
    this.render();
    this.loadArticle();
  }

  async loadArticle() {
    const uuid = this.getAttribute('uuid');
    const locale = this.getAttribute('locale');
    const visitorId = this.getAttribute('visitor-id');

    try {
      // could be remote host if CORS configured
      // host could be from attribute
      // or compiled into versions of script on cdn
      // with preproduction on different hosts
      // https://api.host.com/api/v1/articles/${uuid}?locale=${locale}
      const response = await fetch(`api/v1/articles/${uuid}.json`, {
        headers: { 'Visitor-ID': visitorId }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const articleContent = data.content || '';
      this.shadowRoot.querySelector('slot').innerHTML = articleContent;
    } catch (error) {
      console.error('Fetch Error: ', error);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        /* Sample CSS mimicking a traditional news article style */
        :host {
          --background-color: var(--article-content-background-color, #fff);
          --padding: var(--article-content-padding, 1em);
        }
        article {
          background-color: var(--background-color);
          max-width: 800px;
          margin: 0 auto;
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          padding: var(--padding);
        }
        h1 {
          font-size: 2em;
          margin-bottom: 0.5em;
        }
        p {
          margin-bottom: 1em;
          text-align: justify;
        }
        /* Add more CSS to fit desired style */
      </style>
      <article>
        <slot></slot>
      </article>
    `;
  }
}

customElements.define('article-content', ArticleContent);
