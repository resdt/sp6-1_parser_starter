const CURRENCY_MAP = {
  $: 'USD',
  '€': 'EUR',
  '₽': 'RUB',
};

function parsePage() {
  const headContainer = document.querySelector('head');

  const rawTitle = headContainer.querySelector('title').textContent.trim();
  let [pageTitle, _] = rawTitle.split('—');
  pageTitle = pageTitle.trim();

  let pageDescription = null;
  let keywords = null;
  let opengraphTitle = null;
  let opengraphImage = null;
  let opengraphType = null;

  const metaTags = headContainer.querySelectorAll('meta');
  for (const metaTag of metaTags) {
    const name = metaTag.getAttribute('name');
    const property = metaTag.getAttribute('property');
    const content = metaTag.getAttribute('content');

    if (name == 'description') {
      pageDescription = content;
    } else if (name == 'keywords') {
      keywords = content.split(',').map(e => e.trim());
    } else if (property == 'og:title') {
      const [title, _] = content.split('—');
      opengraphTitle = title.trim();
    } else if (property == 'og:image') {
      opengraphImage = content;
    } else if (property == 'og:type') {
      opengraphType = content;
    }
  }

  const language = document.querySelector('html').lang;

  const productContainer = document.querySelector('.product');
  const productId = productContainer.dataset.id;
  const productData = productContainer.querySelector('.about');
  const productName = productData.querySelector('.title').textContent.trim();

  const likeButton = productContainer.querySelector('.preview .like');
  const isLiked = likeButton.classList.contains('active');

  const tagCategories = [];
  const tagDiscounts = [];
  const tagLabels = [];

  const tags = productData.querySelectorAll('.tags span');
  for (const tag of tags) {
    const name = tag.textContent.trim();

    switch (tag.className) {
      case 'green':
        tagCategories.push(name);
        break;
      case 'red':
        tagDiscounts.push(name);
        break;
      case 'blue':
        tagLabels.push(name);
        break;
    }
  }

  const priceContainer = productData.querySelector('.price');
  const rawPrice = priceContainer.textContent.trim();
  const price = parseInt(rawPrice.slice(1));

  const oldPriceContainer = priceContainer.querySelector('span');
  const oldPrice = parseInt(oldPriceContainer.textContent.trim().slice(1));

  const discount = oldPrice - price;
  const discountPercent = (discount / oldPrice) * 100;

  const currencySymbol = rawPrice.trim()[0];
  const currency = CURRENCY_MAP[currencySymbol];

  const productProperties = {};
  const propertiesData = productContainer.querySelectorAll(
    '.properties li span'
  );
  for (let i = 0; i < propertiesData.length - 1; i += 2) {
    const key = propertiesData[i].textContent.trim();
    const val = propertiesData[i + 1].textContent.trim();

    productProperties[key] = val;
  }

  const productDescriptionDom = productContainer.querySelector('.description');
  const productDescriptionTitle = productDescriptionDom.querySelector('h3');
  productDescriptionTitle.removeAttribute('class');
  const productDescription = productDescriptionDom.innerHTML.trim();

  const productImages = [];
  const navButtonImages = productContainer.querySelectorAll(
    '.preview nav button img'
  );
  for (const image of navButtonImages) {
    const imageData = {
      preview: image.src,
      full: image.dataset.src,
      alt: image.alt,
    };
    productImages.push(imageData);
  }

  const suggestedProducts = [];
  const suggestedItemData = document.querySelectorAll(
    '.suggested .items article'
  );
  for (const item of suggestedItemData) {
    const name = item.querySelector('h3').textContent.trim();
    const description = item.querySelector('p').textContent.trim();
    const image = item.querySelector('img').src;

    const rawPrice = item.querySelector('b').textContent.trim();
    const price = rawPrice.slice(1);

    const currencySymbol = rawPrice[0];
    const currency = CURRENCY_MAP[currencySymbol];

    const product = {
      name: name,
      description: description,
      image: image,
      price: price,
      currency: currency,
    };
    suggestedProducts.push(product);
  }

  const reviews = [];
  const reviewItemData = document.querySelectorAll('.reviews .items article');
  for (const item of reviewItemData) {
    const rating = item.querySelectorAll('.rating .filled').length;
    const title = item.querySelector('.title').textContent.trim();

    const descriptionContainer = item.children[1];
    const description = descriptionContainer
      .querySelector('p')
      .textContent.trim();

    const authorData = item.querySelector('.author');
    const avatar = authorData.querySelector('img').src;
    const name = authorData.querySelector('span').textContent.trim();
    const author = { avatar: avatar, name: name };

    const rawDate = authorData.querySelector('i').textContent.trim();
    const [day, month, year] = rawDate.split('/');
    const date = `${day}.${month}.${year}`;

    const review = {
      rating: rating,
      author: author,
      title: title,
      description: description,
      date: date,
    };
    reviews.push(review);
  }

  return {
    meta: {
      title: pageTitle,
      description: pageDescription,
      keywords: keywords,
      language: language,
      opengraph: {
        title: opengraphTitle,
        image: opengraphImage,
        type: opengraphType,
      },
    },
    product: {
      id: productId,
      name: productName,
      isLiked: isLiked,
      tags: {
        category: tagCategories,
        discount: tagDiscounts,
        label: tagLabels,
      },
      price: price,
      oldPrice: oldPrice,
      discount: discount,
      discountPercent:
        discountPercent == 0 ? '0%' : `${discountPercent.toFixed(2)}%`,
      currency: currency,
      properties: productProperties,
      description: productDescription,
      images: productImages,
    },
    suggested: suggestedProducts,
    reviews: reviews,
  };
}

window.parsePage = parsePage;
