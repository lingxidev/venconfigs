class NewComicSource extends ComicSource {
  // 首行必须为class...

  // 此漫画源的名称
  name = "国屋漫画";

  // 唯一标识符
  key = "dmwmh";

  version = "1.0.2";

  minAppVersion = "1.4.7";

  // 更新链接
  url = "https://github.com/lingxidev/venconfigs/blob/main/dmwmh.js";

  /// APP启动时或者添加/更新漫画源时执行此函数
  init() {}

  /// 账号
  /// 设置为null禁用账号功能
  account = {
    /// 登录
    /// 返回任意值表示登录成功
    login: async (account, pwd) => {
      let res = await Network.post(
        "http://m.dumanwu1.com//api/user/userarr/login",
        {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        },
        `user=${account}&pass=${pwd}`
      );

      let data = JSON.parse(res.body);

      if (res.status !== 200) {
        throw "Invalid status code: " + res.status;
      } else if (data["code"] !== 0) {
        throw "Invalid response: " + data["msg"];
      } else {
        return "ok";
      }
    },

    // 退出登录时将会调用此函数
    logout: () => {
      Network.deleteCookies("ymcdnyfqdapp.qmwmh.com");
    },

    registerWebsite: "http://m.dumanwu1.com//user/register/",
  };
  parseComic(e) {
    let id = e.querySelector("a").attributes["href"];
    let title = e.querySelector(".card-title").text.trim();
    let cover = e.querySelector(".card-graph > img").attributes["src"];
    let tagQ = e.querySelectorAll(".tags-list > .item");
    let tags = [];
    if (tagQ) {
      tags = tagQ.map((e) => e.text.trim());
    }
    // let description = e.querySelector(".card-text").text.trim()
    let description = "";
    return {
      id: id,
      title: title,
      cover: cover,
      tags: tags,
      description: description,
    };
  }
  filterComic(e) {
    let cover = e.querySelector(".card-graph > img").attributes["src"];
    if (
      cover.includes("9mh") ||
      cover.includes("doushou") ||
      cover.includes("boylove")
    ) {
      return false;
    }
    return true;
  }

  /// 探索页面
  /// 一个漫画源可以有多个探索页面
  explore = [
    {
      /// 标题
      /// 标题同时用作标识符, 不能重复
      title: this.name,

      /// singlePageWithMultiPart 或者 multiPageComicList
      type: "singlePageWithMultiPart",

      /*
            加载漫画
            如果类型为multiPageComicList, load方法应当接收一个page参数, 并且返回漫画列表
            ```
            load: async (page) => {
                let res = await Network.get("https://example.com")

                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let data = JSON.parse(res.body)

                function parseComic(comic) {
                    // ...

                    return {
                        id: id,
                        title: title,
                        subTitle: author,
                        cover: cover,
                        tags: tags,
                        description: description
                    }
                }

                return {
                    comics: data.list.map(parseComic),
                    maxPage: data.maxPage
                }
            }
            ```
            */
      load: async () => {
        let res = await InAppOpen.load(
          "http://m.dumanwu1.com/",
          {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
          },
          "document.documentElement.outerHTML;"
        );
        // let res = await Network.get("http://m.dumanwu1.com/", {
        //   "User-Agent":
        //     "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        // });
        if (res.status !== 200) {
          throw "Invalid status code: " + res.status;
        }

        function parseComic(element) {
          let title = element.querySelector(".detail-title").text.trim();
          let imgE = element.querySelector("img");
          let cover = imgE.attributes["data-src"] ? imgE.attributes["data-src"] : imgE.attributes["src"];
          let tags = [];
          let id = element.querySelector("a").attributes["href"];
          let subTitle = element.querySelector(".chap-detail").text;
          return {
            title: title,
            cover: cover,
            tags: tags,
            id: id,
            subTitle: subTitle,
          };
        }

        let document = new HtmlDocument(res.body);
        let parts = document.querySelectorAll(".view-box .view-list");
        let result = {};
        for (let part of parts) {
          let title = part.querySelector("h3").text.trim();
          let comics = part
            .querySelectorAll(".view-ul li")
            .map((e) => parseComic(e));
          if (comics.length > 0) {
            result[title] = comics;
          }
        }
        return result;
      },
    },
  ];

  /// 分类页面
  /// 一个漫画源只能有一个分类页面, 也可以没有, 设置为null禁用分类页面
  category = {
    /// 标题, 同时为标识符, 不能与其他漫画源的分类页面重复
    title: "国屋漫画",
    parts: [
      {
        name: "分类",

        // fixed 或者 random
        // random用于分类数量相当多时, 随机显示其中一部分
        type: "fixed",

        // 如果类型为random, 需要提供此字段, 表示同时显示的数量
        // randomNumber: 5,

        categories: ['冒险', '热血', '都市', '玄幻', '悬疑', '耽美', '恋爱', '生活', '搞笑', '穿越', '修真', '后宫', '女主', '古风', '连载', '完结'],

        // category或者search
        // 如果为category, 点击后将进入分类漫画页面, 使用下方的`categoryComics`加载漫画
        // 如果为search, 将进入搜索页面
        itemType: "category",
        categoryParams: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16']
      },
      {
        name: "排行",

        // fixed 或者 random
        // random用于分类数量相当多时, 随机显示其中一部分
        type: "fixed",

        // 如果类型为random, 需要提供此字段, 表示同时显示的数量
        // randomNumber: 5,

        categories: ['精品榜', '人气榜', '推荐榜', '黑马榜', '最近更新', '新漫画'],

        // category或者search
        // 如果为category, 点击后将进入分类漫画页面, 使用下方的`categoryComics`加载漫画
        // 如果为search, 将进入搜索页面
        itemType: "category",
        categoryParams: ['1','2','3','4','5','6']
      },
      // {
      //     name: "更新",
      //     type: "fixed",
      //     categories: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
      //     itemType: "category",
      //     categoryParams: ['1', '2', '3', '4', '5', '6', '7']
      // }
    ],
    enableRankingPage: false,
  };

  /// 分类漫画页面, 即点击分类标签后进入的页面
  categoryComics = {
    load: async (category, param, options, page) => {
    //   category = encodeURIComponent(category);
      console.log(category);
      console.log(param);
      console.log(options);
      console.log(page);
      console.log("===================");
      let path = 'sort'
      if (['精品榜', '人气榜', '推荐榜', '黑马榜', '最近更新', '新漫画'].includes(category)){
        path = 'rank'
      }
      if (page > 1){
            let url = "";
            url = `http://m.dumanwu1.com/data/${path}`;
            let res = await Network.post(url, {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            },`s=${param}&p=${page}`);
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status;
            }
            
            let json = JSON.parse(res.body);
            let data = [];
            if (json["code"] === "200" || json["code"] === 200) {
                data = json["data"];
            }

            function parseComic(element) {
                let title = element.name;
                let cover = element.imgurl;
                let id = element.id;
                let updateInfo = element.remarks;
                return {
                    title: title,
                    cover: cover,
                    id: `/${id}/`,
                    subTitle: updateInfo,
                };
            }
            let maxPage = null;
            return {
                comics: data.map(parseComic),
                maxPage: maxPage,
            };

      }else {
            let url = "";
            url = `http://m.dumanwu1.com/${path}/${param}`;
            let res = await Network.get(url, {
                "User-Agent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            });
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status;
            }
            let document = new HtmlDocument(res.body);

            function parseComic(element) {
                let title = element.querySelector(".cartoon-info .simple-info h2").text;
                let imgE = element.querySelector(".poster-box a img")
                let cover = imgE.attributes["data-src"];
                if (!cover) {
                    cover = imgE.attributes["src"];
                }
                let tags = [];
                let link = element.querySelector(".poster-box a").attributes["href"];
                let updateInfo = element.querySelectorAll(".cartoon-info .simple-info p")[1].text;
                return {
                title: title,
                cover: cover,
                tags: tags,
                id: link,
                subTitle: updateInfo,
                };
            }
    
            let maxPage = null;
            return {
                comics: document.querySelectorAll('.rank-box .rank-list li').map(parseComic),
                maxPage: maxPage,
            };
      }
    
    },
    // 提供选项
    optionList: null,
  };

  /// 搜索
  search = {
    load: async (keyword, options, page) => {
      let res = await Network.post(
        `http://m.dumanwu1.com/s`,
        {
            "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        `k=${encodeURIComponent(keyword)}`
      );
      if (res.status !== 200) {
        throw "Invalid status code: " + res.status;
      }

      let json = JSON.parse(res.body);
      let data = [];
      if (json["code"] === "200" || json["code"] === 200) {
        data = json["data"];
      }

      function parseComic(element) {
        let title = element.name;
        let cover = element.imgurl;
        let id = element.id;
        let updateInfo = element.remarks;
        return {
          title: title,
          cover: cover,
          id: `/${id}/`,
          subTitle: updateInfo,
        };
      }
      return {
        comics: data.map(parseComic),
        maxPage: 1,
      };
    },

    // 提供选项
    optionList: [],
  };

  /// 收藏
  favorites = {
    /// 是否为多收藏夹
    multiFolder: false,
    /// 添加或者删除收藏
    addOrDelFavorite: async (comicId, folderId, isAdding) => {
      let id = comicId.split("/")[4];
      if (isAdding) {
        let comicInfoRes = await Network.get(comicId, {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        });
        if (comicInfoRes.status !== 200) {
          throw "Invalid status code: " + res.status;
        }
        let document = new HtmlDocument(comicInfoRes.body);
        let name = document.querySelector("h1").text;
        let res = await Network.post(
          "http://m.dumanwu1.com//api/user/bookcase/add",
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          `articleid=${id}&articlename=${name}`
        );
        if (res.status !== 200) {
          throw "Invalid status code: " + res.status;
        }
        let json = JSON.parse(res.body);
        if (json["code"] === "0" || json["code"] === 0) {
          return "ok";
        } else if (json["code"] === 1) {
          throw "Login expired";
        } else {
          throw json["msg"].toString();
        }
      } else {
        let res = await Network.post(
          "http://m.dumanwu1.com//api/user/bookcase/del",
          {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
          },
          `articleid=${id}`
        );
        if (res.status !== 200) {
          error("Invalid status code: " + res.status);
          return;
        }
        let json = JSON.parse(res.body);
        if (json["code"] === "0" || json["code"] === 0) {
          success("ok");
        } else if (json["code"] === 1) {
          error("Login expired");
        } else {
          error(json["msg"].toString());
        }
      }
    },
    /// 加载漫画
    loadComics: async (page, folder) => {
      let res = await Network.post(
        "http://m.dumanwu1.com//api/user/bookcase/ajax",
        {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        },
        `page=${page}`
      );
      if (res.status !== 200) {
        throw "Invalid status code: " + res.status;
      }
      let json = JSON.parse(res.body);
      if (json["code"] === 1) {
        throw "Login expired";
      }
      if (json["code"] !== "0" && json["code"] !== 0) {
        throw "Invalid response: " + json["code"];
      }
      let comics = json["data"].map((e) => {
        return {
          title: e["name"],
          subTitle: e["author"],
          cover: e["cover"],
          id: "http://m.dumanwu1.com/" + e["info_url"],
        };
      });
      let maxPage = json["end"];
      return {
        comics: comics,
        maxPage: maxPage,
      };
    },
  };

  /// 单个漫画相关
  comic = {
    // 加载漫画信息
    loadInfo: async (id) => {
      let res = await InAppOpen.load(
        `http://m.dumanwu1.com${id}`,
        {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        },
        "document.documentElement.outerHTML;"
      );
    //   let res = await Network.get(`http://m.dumanwu1.com${id}`, {
    //     "User-Agent":
    //       "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    //   });
      if (res.status !== 200) {
        throw "Invalid status code: " + res.status;
      }
      let document = new HtmlDocument(res.body);

      let title = document.querySelector('meta[property="og:title"]')
        .attributes["content"];
      let cover = document.querySelector('meta[property="og:image"]')
        .attributes["content"];
      let author = document.querySelector('meta[property="og:author"]')
        .attributes["content"];
      let tags = [];
      let description = document.querySelector(
        'meta[property="og:description"]'
      ).attributes["content"];
      let updateTime = document.querySelector('meta[property="og:date"]')
        .attributes["content"];

      let chapters = new Map();
      for (let c of document.querySelectorAll(".chaplist-box li a")) {
        let epId = c.attributes["href"];
        //下载路径第一位不能是/
        chapters.set(`.${epId}`, c.text.trim());
      }
      let bookId = id.split('/')[1]
      let chapRes = await Network.post(`http://m.dumanwu1.com/morechapter`, {
            "Content-Type": "application/x-www-form-urlencoded"
        },`id=${bookId}`);
      if (chapRes.status !== 200) {
        throw "Invalid status code: " + chapRes.status;
      }
      let moreChaps = JSON.parse(chapRes.body);
      for (let c of moreChaps.data) {
        let epId = c.chapterid;
        //下载路径第一位不能是/
        chapters.set(`.${id}${epId}.html`, c.chaptername.trim());
      }
      
      function parseComic(element) {
        let title = element.querySelector(".detail-title").text.trim();
        let imgE = element.querySelector("img");
        let cover = imgE.attributes["data-src"] ? imgE.attributes["data-src"] : imgE.attributes["src"];
        let tags = [];
        let id = element.querySelector("a").attributes["href"];
        let subTitle = element.querySelector(".chap-detail").text;
        return {
          title: title,
          cover: cover,
          tags: tags,
          id: id,
          subTitle: subTitle,
        };
      }
      let recommend = [];
      let recommendQ = document.querySelector(".like-more .view-list .view-ul");
      for (let e of recommendQ.querySelectorAll("li")) {
        recommend.push(parseComic(e));
      }
      return {
        title: title,
        cover: cover,
        description: description,
        tags: {
          作者: [author],
          更新: [updateTime],
          标签: tags,
        },
        chapters: chapters,
        recommend: recommend,
      };
    },
    onClickTag: (namespace, tag) => {
      if (namespace == "标签") {
        return {
          // 'search' or 'category'
          action: "category",
          keyword: `${tag}`,
          // {string?} only for category action
          param: null,
        };
      }
      if (namespace == "作者") {
        return {
          // 'search' or 'category'
          action: "search",
          keyword: `${tag}`,
          // {string?} only for category action
          param: null,
        };
      }
      throw "未支持此类Tag检索";
    },
    // 获取章节图片
    loadEp: async (comicId, epId) => {
      let id = epId.substring(1);
    //   let res = await Network.get(`http://m.dumanwu1.com/${id}`, {
    //     "User-Agent":
    //       "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    //   });
      let res = await InAppOpen.load(
        `http://m.dumanwu1.com${id}`,
        {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        },
        "document.documentElement.outerHTML;"
      );
      if (res.status !== 200) {
        throw "Invalid status code: " + res.status;
      }
      let document = new HtmlDocument(res.body);
      return {
        images: document
          .querySelectorAll('.chapter-img-box img')
          .map((e) => {
            if (e.attributes["data-src"]) {
                return e.attributes["data-src"]
            }
            return e.attributes["src"];
          }),
      };
    },
    /// 警告: 这是历史遗留问题, 对于新的漫画源, 不应当使用此字段, 在选取漫画id时, 不应当出现特殊字符
    matchBriefIdRegex: "http://m.dumanwu1.com//(\\d+)/",
  };
}
