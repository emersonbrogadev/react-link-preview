import React, { useState } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';


const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

const getPreviewData = (tags) => {
  const result = tags.reduce((previewData, item) => {
    switch(item.tag) {
      case 'og:title':
        previewData.title = item.value;
        break;
      case 'og:url':
        previewData.link = item.value;
        break;
      case 'og:description':
        previewData.description = item.value;
        break;
      case 'og:site_name':
        previewData.site = item.value;
        break;
      case 'og:image':
        previewData.image = item.value;
        break;
      default:
        break;
    }
    return previewData;
  }, {});

  return Promise.resolve(result);
}

const parseHTML = (html) => {
  const $ = cheerio.load(html);

  const meta = [];
  $('head meta').map((i, item) => {
    if (!item.attribs) return null;

    const property = item.attribs.property || null;
    const content = item.attribs.content || null;

    if (!property || !content) return null;
    meta.push({ tag: property, value: content });
    return null;
  });

  return Promise.resolve(meta);
}

const fetchUrl = (url) => {
  return axios(CORS_PROXY + url)
    .then(response => response.data);
};

const getUrl = (text) => {
  if (!text) return null;

  const a = document.createElement('a');
  a.href = text;

  const { protocol, host, pathname, search, hash } = a;

  const url = `${protocol}//${host}${pathname}${search}${hash}`;

  const isSameHost = (host === window.location.host);

  if (isSameHost) return null;
  
  return url;
};


function App() {

  const [previewData, setPreviewData] = useState(null);

  const onBlur = (e) => {
    const url = getUrl(e.target.value);
    if (!url) return null;
    fetchUrl(url)
      .then(parseHTML)
      .then(getPreviewData)
      .then(setPreviewData)
      .then(console.log)
      .catch(console.error);
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-6">
          <div className="form-group">
            <label>Url</label>
            <input type="text" className="form-control" onBlur={onBlur} />
          </div>
        </div>
      </div>
      {previewData && (
        <div className="row">
          <div className="card col-6 pt-3">
            <img className="card-img-top" src={previewData.image} width="250" alt={previewData.title} />
            <div className="card-body">
              <small>{previewData.site}</small>
              <h5 className="card-title">{previewData.title}</h5>
              <p>{previewData.description}</p>
              <a href={previewData.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Leia Mais...</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
