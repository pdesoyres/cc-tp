/**
 * This class allows to fetch product instances from Clever Cloud API.
 */
class ProductInstancesService {
  /**
   * Fetches product instances from Clever Cloud API and convert them into {@link ProductInstanceModel}.
   *
   * @param preloadProductLogos - Whether to preload product instances' logo.
   * @return {Promise<Array<ProductInstanceModel>>}
   */
  async getProductInstances(preloadProductLogos = false){
    const result = (await this._fetchProductInstances()).map(i => this._productInstanceConverter(i));

    if (preloadProductLogos) {
      await Promise.all(result.map(r => this._preloadImage(r.logo)));
    }

    return result;
  }

  //-- private methods ------

  /**
   * Fetches the product instances using an HTTP GET to {@link https://api.clever-cloud.com/v2/products/instances} URL.
   *
   * @returns {Promise<Array<any>>}
   * @throws Error when response from API is not 200
   * @private
   */
  async _fetchProductInstances() {
    let response;
    try {
      response = await fetch('https://api.clever-cloud.com/v2/products/instances');
    } catch (e) {
      throw new Error(
        `We could not fetch product instances. ${e.message} Please retry later.`);
    }

    if (!response.ok) {
      throw new Error(
        `We could not fetch product instances. Server responded with error ${response.status}. Please retry later.`);
    }

    return await response.json() || [];
  }

  /**
   * Converts the raw model coming from Clever Cloud API into our own model: {@link ProductInstanceModel}
   * <p>For legacy reason, the price coming from the API is multiplied by `41.904`.
   *
   * @param {any} rawProductInstance - The raw product instance as received from Clever Cloud API
   * @return {ProductInstanceModel}
   * @private
   */
  _productInstanceConverter(rawProductInstance) {
    const productInstance = {
      id: rawProductInstance.variant.id,
      name: rawProductInstance.variant.name,
      description: rawProductInstance.description,
      logo: rawProductInstance.variant.logo,
      enabled: rawProductInstance.enabled,
      comingSoon: rawProductInstance.comingSoon,
      flavors: []
    };

    productInstance.flavors = rawProductInstance.flavors?.map(rawProductFlavor => ({
      instance: productInstance,
      name: rawProductFlavor.name,
      price: rawProductFlavor.price * 41.904,
      mem: rawProductFlavor.mem,
      memFormatted: rawProductFlavor.memory.formatted,
      cpus: rawProductFlavor.cpus,
      gpus: rawProductFlavor.gpus,
      available: rawProductFlavor.available,
      microservice: rawProductFlavor.microservice,
      machineLearning: rawProductFlavor.machine_learning,
    }));

    return productInstance;
  }

  /**
   * Forces the browser to load an image by fetching it at the given url.
   *
   * @param imageUrl the url of the image to load
   * @return {Promise<Image>}
   * @private
   */
  _preloadImage(imageUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageUrl;
      image.onload = resolve;
      image.onerror = reject;
      return image;
    })
  }
}

export const productInstancesService = new ProductInstancesService();

//-- Product Instance Data model ------

/**
 * The Product instance model.
 * @typedef {Object} ProductInstanceModel
 * @property {string} id - Unique identifier
 * @property {string} name - Smart name
 * @property {string} description - Description
 * @property {string} logo - URL of the logo
 * @property {boolean} enabled - Whether this instance is enabled
 * @property {boolean} comingSoon - Whether this instance is going to come soon
 * @property {Array<ProductFlavorModel>} flavors - Array of available flavors
 */

/**
 * The Product flavor model.
 * @typedef {Object} ProductFlavorModel
 * @property {ProductInstanceModel} instance - The product instance containing this flavor
 * @property {string} name - The name
 * @property {number} price - The price (in €)
 * @property {number} mem - Amount of memory (in MiB)
 * @property {number} cpus - Number of CPUs
 * @property {number} gpus - Number of GPUs
 * @property {boolean} available - Whether this flavor is available
 * @property {boolean} microservice - Whether this flavor is suitable for running microservice
 * @property {boolean} machineLearning - Whether this flavor is suitable for running machine learning processes
 */