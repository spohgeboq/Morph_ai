/**
 * ServiceRegistry — DI-контейнер для AI-провайдеров.
 * 
 * Паттерн: каждый провайдер регистрируется с уникальным именем.
 * При получении запроса на генерацию, Registry по имени провайдера
 * из config/models.js направляет вызов в нужный сервис.
 */

class ServiceRegistry {
  constructor() {
    /** @type {Map<string, object>} */
    this.providers = new Map();
  }

  /**
   * Зарегистрировать провайдер.
   * @param {string} name — 'openrouter' | 'piapi' | 'runway' | 'faceswap'
   * @param {object} serviceInstance — экземпляр сервиса с методом generate()
   */
  register(name, serviceInstance) {
    if (this.providers.has(name)) {
      console.warn(`[ServiceRegistry] Провайдер "${name}" уже зарегистрирован, перезаписываем.`);
    }
    this.providers.set(name, serviceInstance);
    console.log(`[ServiceRegistry] ✓ Зарегистрирован провайдер: ${name}`);
  }

  /**
   * Получить провайдер по имени.
   * @param {string} name
   * @returns {object}
   * @throws {Error} — если провайдер не зарегистрирован
   */
  getProvider(name) {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`[ServiceRegistry] Провайдер "${name}" не зарегистрирован`);
    }
    return provider;
  }

  /**
   * Маршрутизировать запрос к нужному провайдеру.
   *
   * @param {string} providerName — имя провайдера из реестра моделей
   * @param {object} params — параметры генерации
   * @param {string} params.slug — slug модели для API провайдера
   * @param {string} params.prompt — промпт
   * @param {object} [params.options] — доп. параметры (aspect_ratio, duration и т.д.)
   * @returns {Promise<object>} — результат от провайдера
   */
  async dispatch(providerName, { slug, prompt, options = {} }) {
    const provider = this.getProvider(providerName);
    return provider.generate({ slug, prompt, options });
  }

  /**
   * Получить список зарегистрированных провайдеров.
   * @returns {string[]}
   */
  listProviders() {
    return Array.from(this.providers.keys());
  }
}

// Singleton — один реестр на всё приложение
const registry = new ServiceRegistry();

module.exports = registry;
