export default {
  routes: [
      {
          method: "GET",
          path: "/games",
          handler: "api::game.game.find",
          config: {}
      },
      {
          method: "GET",
          path: "/games/:id",
          handler: "api::game.game.findOne",
          config: {}
      },
      {
          method: "POST",
          path: "/games",
          handler: "api::game.game.create",
          config: {}
      },
      {
          method: "PUT",
          path: "/games/:id",
          handler: "api::game.game.update",
          config: {}
      },
      {
          method: "DELETE",
          path: "/games/:id",
          handler: "api::game.game.delete",
          config: {}
      },
      {
        method: "POST",
        path: "/games/populate",
        handler: "api::game.game.populate",
        config: {},
      },
  ]
};

