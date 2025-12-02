class NewComicSource extends ComicSource {  // 首行必须为class...

    // 此漫画源的名称
    name = "奇漫漫画"

    // 唯一标识符
    key = "qmhmh"

    version = "1.0.0"

    minAppVersion = "1.4.7"

    // 更新链接
    url = "https://github.com/lingxidev/venconfigs/blob/main/qmhmh.js"

    /// APP启动时或者添加/更新漫画源时执行此函数
    init() {

    }

    /// 账号
    /// 设置为null禁用账号功能
    account = {
        /// 登录
        /// 返回任意值表示登录成功
        login: async (account, pwd) => {
            let res = await Network.post("https://m.qimanwu.org/api/user/userarr/login", {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            }, `user=${account}&pass=${pwd}`)

            let data = JSON.parse(res.body)

            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            } else if (data["code"] !== 0) {
                throw "Invalid response: " + data["msg"]
            } else {
                return 'ok'
            }

        },

        // 退出登录时将会调用此函数
        logout: () => {
            Network.deleteCookies("ymcdnyfqdapp.ikmmh.com")
        },

        registerWebsite: "https://m.qimanwu.org/user/register/"
    }
    parseComic(e) {
        let url = e.querySelector("a").attributes['href']
        let id = url.split("/").pop()
        let title = e.querySelector(".card-title").text.trim()
        let cover = e.querySelector(".card-graph > img").attributes["src"]
        let tagQ = e.querySelectorAll(".tags-list > .item")
        let tags = []
        if (tagQ) {
            tags = tagQ.map(e => e.text.trim())
        }
        let description = e.querySelector(".card-text").text.trim()
        return {
            id: id,
            title: title,
            cover: cover,
            tags: tags,
            description: description
        }
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
                let res = await Network.get("https://m.qimanwu.org", {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                })
                if (res.status !== 200) {
                    throw "Invalid status code: " + res.status
                }
        
                let document = new HtmlDocument(res.body)
                let titles = document.querySelectorAll('.list-top .list-topic').map( res => {
                   return  res.attributes["alt"]
                })
                let parts = document.querySelectorAll('.am-scrollable-horizontal .indexList')
                function parseComic(e) {
                    let id = e.querySelector('a').attributes['href']
                    let bottom = e.querySelector('.bottom')
                    let subTitle = ''
                    if (bottom) {
                        subTitle = bottom.text.trim()
                    }
                    let halfImg = e.querySelector('.halfImg')
                    let title = halfImg.attributes['title'].trim()
                    let cover = halfImg.attributes['src']
                    return {
                        id: id,
                        title: title,
                        subTitle: subTitle,
                        cover: cover,
                        tags: []
                    }
                }
                let result = {}
                for (let index = 0; index < parts.length; index++) {
                    const title = titles[index];
                    const part = parts[index];
                    let comics = part.querySelectorAll('.item').map(e => parseComic(e))
                    if(comics.length > 0) {
                        result[title] = comics
                    }
                }          
                let comics =  document.querySelectorAll('.m_list_1 a').map(e => {
                    let id = e.attributes["href"]
                    let info = e.querySelector('.info')
                    let title = info.querySelector('.title').text.trim()
                    let subTitle = info.querySelector('.subtitle').text.trim()
                    let description = info.querySelector('.content').text.trim()
                    let cover = e.querySelector('img').attributes['src']
                    return {
                        id: id,
                        title: title,
                        subTitle: subTitle,
                        description: description,
                        cover: cover
                    }
                })
                let title = titles[titles.length - 1]
                result[title] = comics
                return result
            }
        }
    ]

    /// 分类页面
    /// 一个漫画源只能有一个分类页面, 也可以没有, 设置为null禁用分类页面
    category = {
        /// 标题, 同时为标识符, 不能与其他漫画源的分类页面重复
        title: "奇漫漫画",
        parts: [
            {
                name: "分类",

                // fixed 或者 random
                // random用于分类数量相当多时, 随机显示其中一部分
                type: "fixed",

                // 如果类型为random, 需要提供此字段, 表示同时显示的数量
                // randomNumber: 5,

                categories: ['排行榜', '已完结', '连载', '日榜', '周榜', '月榜', '国产漫画', '日本漫画', '韩国漫画', '欧美漫画'],

                // category或者search
                // 如果为category, 点击后将进入分类漫画页面, 使用下方的`categoryComics`加载漫画
                // 如果为search, 将进入搜索页面
                itemType: "category",
                categoryParams: ['/custom/top', '/custom/end', '/custom/serialize', '/custom/day', '/custom/week', '/custom/month', '/category/list/1', '/category/list/2', '/category/list/3', '/category/list/4']
            }
        ],
        enableRankingPage: false,
    }

    /// 分类漫画页面, 即点击分类标签后进入的页面
    categoryComics = {
        load: async (category, param, options, page) => {
            let maxPage = 1
            let url = `https://m.qimanwu.org${param}`
            if (param.includes("category/list")) {
                if (page > 1) {
                  url += `/page/${page}`
                }
                maxPage = null
            }
            let res = await Network.get(url, {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            function parseComic(e) {
                let id = e.querySelector('a').attributes['href']
                let info = e.querySelector('.info')
                let title = info.querySelector('.title').text.trim()
                let subTitle = info.querySelector('.subtitle').text.trim()
                let cover = e.querySelector('a img').attributes['src']
                return {
                    id: id,
                    title: title,
                    subTitle: subTitle,
                    cover: cover
                }
            }
            return {
                comics: document.querySelectorAll('.rankList li').map(parseComic),
                maxPage: maxPage
            }
        },
        // 提供选项
        optionList: [],
    }

    /// 搜索
    search = {
        load: async (keyword, options, page) => {
            let res = await Network.get(`https://m.qimanwu.org/search?key=${encodeURIComponent(keyword)}`, {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)

            function parseComic(e) {
                let id = e.querySelector('a').attributes['href']
                let info = e.querySelector('.info')
                let title = info.querySelector('.title').text.trim()
                let subTitle = info.querySelector('.subtitle').text.trim()
                let cover = e.querySelector('a img').attributes['src']
                return {
                    id: id,
                    title: title,
                    subTitle: subTitle,
                    cover: cover
                }
            }

            return {
                comics: document.querySelectorAll('.rankList li').map(parseComic),
                maxPage: 1
            }
        },

        // 提供选项
        optionList: []
    }

    /// 收藏
    favorites = {
        /// 是否为多收藏夹
        multiFolder: false,
        /// 添加或者删除收藏
        addOrDelFavorite: async (comicId, folderId, isAdding) => {
            let id = comicId.split("/")[4]
            if (isAdding) {
                let comicInfoRes = await Network.get(comicId, {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                });
                if (comicInfoRes.status !== 200) {
                    throw "Invalid status code: " + res.status
                }
                let document = new HtmlDocument(comicInfoRes.body)
                let name = document.querySelector("h1").text;
                let res = await Network.post("https://m.qimanwu.org/api/user/bookcase/add", {
                    "Content-Type": "application/x-www-form-urlencoded",
                }, `articleid=${id}&articlename=${name}`)
                if (res.status !== 200) {
                    throw "Invalid status code: " + res.status
                }
                let json = JSON.parse(res.body)
                if (json["code"] === "0" || json["code"] === 0) {
                    return 'ok'
                } else if (json["code"] === 1) {
                    throw "Login expired"
                } else {
                    throw json["msg"].toString()
                }
            } else {
                let res = await Network.post("https://m.qimanwu.org/api/user/bookcase/del", {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }, `articleid=${id}`)
                if (res.status !== 200) {
                    error("Invalid status code: " + res.status)
                    return;
                }
                let json = JSON.parse(res.body)
                if (json["code"] === "0" || json["code"] === 0) {
                    success("ok")
                } else if (json["code"] === 1) {
                    error("Login expired")
                } else {
                    error(json["msg"].toString())
                }
            }
        },
        /// 加载漫画
        loadComics: async (page, folder) => {
            let res = await Network.post("https://m.qimanwu.org/api/user/bookcase/ajax", {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            }, `page=${page}`)
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let json = JSON.parse(res.body)
            if (json["code"] === 1) {
                throw "Login expired"
            }
            if (json["code"] !== "0" && json["code"] !== 0) {
                throw "Invalid response: " + json["code"]
            }
            let comics = json["data"].map(e => {
                return {
                    title: e["name"],
                    subTitle: e["author"],
                    cover: e["cover"],
                    id: "https://m.qimanwu.org" + e["info_url"]
                }
            })
            let maxPage = json["end"]
            return {
                comics: comics,
                maxPage: maxPage
            }
        }
    }

    /// 单个漫画相关
    comic = {
        // 加载漫画信息
        loadInfo: async (id) => {
            let res = await Network.get('https://m.qimanwu.org' + id, {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            let info = document.querySelector('.detailTop .info')
            let title = info.querySelector('.title').text
            let cover = document.querySelector('.detailTop .cover').attributes["src"]
            let description = document.querySelector('.detailContent p').text
            let allSubtitle = info.querySelectorAll('.subtitle')
            let updateTime = document.querySelector('#chapter .top span')
            let tags = {}
            let temp = [...allSubtitle,updateTime]
            temp.forEach(res => {
                let key = res.text.split('：')[0]
                let value = res.text.split('：')[1]
                if (value) {
                    if (key == '类型') {
                        tags[key] = value.split(' ').filter(res => res.trim().length > 0)
                    }else {
                        tags[key] = [value]
                    }
                }
            })
            let eps = {}
            document.querySelectorAll('#chapter .chapterList li a').forEach((element) => {
                //为了拼接下载路径
                let url = element.attributes['href']
                eps[`.${url}`] = element.text.trim()
            })
            let comics = []
            return {
                title: title,
                cover: cover,
                description: description,
                tags: tags,
                chapters: eps,
                recommend: comics
            }
        },
        // 获取章节图片
        loadEp: async (comicId, epId) => {
            let id = epId.substring(1);
            let res = await InAppOpen.load(
                `https://m.qimanwu.org${id}`,
                {
                    "Referer": `https://m.qimanwu.org${id}`,
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                },
                'window.params'
            )
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            if (!res.body || !res.body.images) {
                throw "Invalid images"
            }
            return {
                images: res.body.images
            }
        },
        /// 警告: 这是历史遗留问题, 对于新的漫画源, 不应当使用此字段, 在选取漫画id时, 不应当出现特殊字符
        matchBriefIdRegex: "https://m.qimanwu.org/book/(\\d+)/"
    }
}
