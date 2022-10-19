/**
 * game service
 */

import { GenericService } from '@strapi/strapi/lib/core-api/service';
import { factories } from '@strapi/strapi';


import { JSDOM } from 'jsdom'
import axios from 'axios'
import FormData from 'form-data'
import slugify from 'slugify'

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const Exception = (e) => {
  return { e, data: e.data && e.data.errors }
}

const getGameInfo = async (slug) => {
  try {
    const body = await axios.get(`https://gog.com/game/${slug}`)
    const dom = new JSDOM(body.data)
  
    const description = dom.window.document.querySelector('.description')
  
    return {
      rating: 'FREE',
      short_description: description.textContent.trim().slice(0, 160),
      description: description.innerHTML,
    }
  } catch (e) {
    console.log("getGameInfo error: ", Exception(e));
  }

}

const getByName = async (name, entityName) => {
  const entry = await strapi.entityService.findMany(entityName, {
    filters: {
      name: name,
    },
  });

  return entry.length > 0 ? entry[0] : null;
}

const create = async (name, entityName) => {
  const entry = await getByName(name, entityName);

  if (!entry) {
    return await strapi.entityService.create(entityName, {
      data: {
        name: name,
        slug: slugify(name, { lower: true }),
      },
    });
  }
}

const createManyToMany = async (products) => {
  const developers = {}
  const categories = {}
  const platforms = {}
  const publishers = {}

  products.forEach(product => {
    const { developer, genres, publisher, supportedOperatingSystems } = product

    genres &&
      genres.forEach(genre => {
        categories[genre] = true;
      })

    supportedOperatingSystems && supportedOperatingSystems.forEach(system => {
      platforms[system] = true
    })

    developers[developer] = true
    publishers[publisher] = true
  })

  return Promise.all([
    ...Object.keys(developers).map(async (developer) => await create(developer, 'api::developer.developer')),
    ...Object.keys(publishers).map(async (publisher) => await create(publisher, 'api::publisher.publisher')),
    ...Object.keys(platforms).map(async (platform) => await create(platform, 'api::platform.platform')),
    ...Object.keys(categories).map(async (category) => await create(category, 'api::category.category'))
  ])
}

const setImage = async({ image, game, field = "cover" }) => {
  try {
    const url = `https:${image}_bg_crop_1680x655.jpg`
  
    const { data } = await axios.get(url, { responseType: "arraybuffer" })
    const buffer = Buffer.from(data, 'base64')
  
    const formData = new FormData()
  
    formData.append("refId", game.id)
    formData.append("ref", "api::game.game")
    formData.append("field", field)
    formData.append("files", buffer, { filename: `${game.slug}.jpg` })
  
    console.info(`Uploading ${field} image: ${game.slug}.jpg`)

    await axios({
      method: "POST",
      url: `http://${process.env.HOST}:${process.env.PORT}/api/upload`,
      data: formData,
      headers: { 'Content-Type': `multipart/form-data;` }
    })
    

  } catch (e) {
    console.log("setImage error: ", Exception(e));    
  }
}

const createGames = async (products) => {
  await Promise.all(
    products.map(async (product) => {
      const entry = await getByName(product.title, 'api::game.game');

      if (!entry) {
        console.info(`Creating ${product.title}...`)

        const game = await strapi.entityService.create('api::game.game', {
          data: {
            name: product.title,
            slug: product.slug.replace(/_/g, '-'),
            price: product.price.amount,
            release_date: new Date(
              Number(product.globalReleaseDate) * 1000
            ).toISOString(),
            categories: await Promise.all(
              product.genres.map(genre => getByName(genre, 'api::category.category'))
            ),
            platforms: await Promise.all(
              product.supportedOperatingSystems.map(os => getByName(os, 'api::platform.platform'))
            ),
            developers: [await getByName(product.developer, 'api::developer.developer')],
            publisher: [await getByName(product.publisher, 'api::publisher.publisher')],
            ...(await getGameInfo(product.slug))
          },
        });

        await setImage({ image: product.image, game })

        await Promise.all(
          product.gallery.slice(0, 5).map(url => setImage({ image: url, game, field: 'gallery' }))
        )

        await timeout(2000)

        return game
      }
    })
  )
}


export default factories.createCoreService('api::game.game', ({ strapi }) => ({
  populate: async (params) => {
    try {
      const gogApiUrl = `https://www.gog.com/games/ajax/filtered?mediaType=game&page=1&sort=popularity`
      const { data: { products } } = await axios.get(gogApiUrl);
  
      await createManyToMany([products[7], products[8]])
      await createGames([products[7], products[8]])
      
    } catch (e) {
      console.log("populate service: ", Exception(e));
    }
  }
}) as GenericService);
