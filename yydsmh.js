class NewComicSource extends ComicSource {  // 首行必须为class...

    // 此漫画源的名称
    name = "喜看漫画"

    // 唯一标识符
    key = "yydsmh"

    version = "1.0.1"

    minAppVersion = "1.0.0"

    // 更新链接
    url = "https://github.com/lingxidev/venconfigs/blob/main/yydsmh.js"

    /// APP启动时或者添加/更新漫画源时执行此函数
    init() {

    }

    /// 账号
    /// 设置为null禁用账号功能
    account = {
        /// 登录
        /// 返回任意值表示登录成功
        login: async (account, pwd) => {
            let res = await Network.post("https://www.yydsmh.com/api/user/userarr/login", {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
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
            Network.deleteCookies("ymcdnyfqdapp.qmwmh.com")
        },

        registerWebsite: "https://www.yydsmh.com/user/register/"
    }
    parseComic(e) {
        let id = e.querySelector("a").attributes['href']
        let title = e.querySelector(".card-title").text.trim()
        let cover = e.querySelector(".card-graph > img").attributes["src"]
        let tagQ = e.querySelectorAll(".tags-list > .item")
        let tags = []
        if (tagQ) {
            tags = tagQ.map(e => e.text.trim())
        }
        // let description = e.querySelector(".card-text").text.trim()
        let description = ''
        return {
            id: id,
            title: title,
            cover: cover,
            tags: tags,
            description: description
        }
    }
    filterComic(e) {
        let cover = e.querySelector(".card-graph > img").attributes["src"]
        if (cover.includes('9mh') ||  cover.includes('doushou') ||  cover.includes('boylove')) {
            return false
        }
        return true
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
                let res = await Network.get("https://www.yydsmh.com", {
                    // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    // "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                    // "Host": "www.yydsmh.com",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                    // "Referer": "https://www.yydsmh.com/",
                    // "Accept-Encoding": "gzip, deflate",
                    // "Connection": "keep-alive",
                    // "Pragma": "no-cache",
                    // "Cache-Control": "no-cache",
                    // "Cookie": "PHPSESSID=5a8e7f3b2c1d0e9f8a7b6c5d4e3f2g1h; _fw_crm_v=6e3a8b2f-4c7d-4e9a-b2f8-7d5e6f3a2b1c; first_session=%7B%22visits%22%3A5%2C%22start%22%3A1751504104903%2C%22last_visit%22%3A1751511120790%2C%22url%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2Fuser%2Findex%22%2C%22path%22%3A%22%2Fuser%2Findex%22%2C%22referrer%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2F%22%2C%22referrer_info%22%3A%7B%22host%22%3A%22www.yydsmh.com%22%2C%22path%22%3A%22%2F%22%2C%22protocol%22%3A%22http%3A%22%2C%22port%22%3A80%2C%22search%22%3A%22%22%2C%22query%22%3A%7B%7D%7D%2C%22search%22%3A%7B%22engine%22%3Anull%2C%22query%22%3Anull%7D%2C%22prev_visit%22%3A1751504340089%2C%22time_since_last_visit%22%3A6780701%2C%22version%22%3A0.4%7D; articlevisited=1; Expires=Fri, 31 Dec 2025 23:59:59 GMT; Max-Age=63072000"
                })
                if (res.status !== 200) {
                    throw "Invalid status code: " + res.status
                }
        
                let document = new HtmlDocument(res.body)
                let parts = document.querySelectorAll('.mult.sow')
                let result = {}
                for (let part of parts) {
                    let title = part.querySelector(".mult-title").text.trim()
                    let comics = part.querySelectorAll(".card").filter(e => this.filterComic(e)).map(e => this.parseComic(e))
                    if(comics.length > 0) {
                        result[title] = comics
                    }
                }
                return result
                
            }
        }
    ]

    /// 分类页面
    /// 一个漫画源只能有一个分类页面, 也可以没有, 设置为null禁用分类页面
    category = {
        /// 标题, 同时为标识符, 不能与其他漫画源的分类页面重复
        title: "喜看漫画",
        parts: [
            {
                name: "分类",

                // fixed 或者 random
                // random用于分类数量相当多时, 随机显示其中一部分
                type: "fixed",

                // 如果类型为random, 需要提供此字段, 表示同时显示的数量
                // randomNumber: 5,

                categories: ["全部", "长条", "大女主", "百合", "耽美", "纯爱", "後宫","韩漫", "奇幻", "轻小说", "生活", "悬疑", "格斗", "搞笑","伪娘", "竞技", "职场", "萌系", "冒险", "治愈", "都市","霸总", "神鬼", "侦探", "爱情", "古风", "欢乐向", "科幻","穿越", "性转换", "校园", "美食", "悬疑", "剧情", "热血","节操", "励志", "异世界", "历史", "战争", "恐怖", "霸总"],

                // category或者search
                // 如果为category, 点击后将进入分类漫画页面, 使用下方的`categoryComics`加载漫画
                // 如果为search, 将进入搜索页面
                itemType: "category",
            }
            // {
            //     name: "更新",
            //     type: "fixed",
            //     categories: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
            //     itemType: "category",
            //     categoryParams: ['1', '2', '3', '4', '5', '6', '7']
            // }
        ],
        enableRankingPage: false,
    }

    /// 分类漫画页面, 即点击分类标签后进入的页面
    categoryComics = {
        load: async (category, param, options, page) => {
            category = encodeURIComponent(category)
            console.log(category)
            console.log(param)
            console.log(options)
            console.log(page)
            console.log('===================')
            let url = ""
            if (param !== undefined && param !== null) {
                url = `https://www.yydsmh.com/manga-lists/9/${category}/3/1.html"`
            } else {
                url = `https://www.yydsmh.com/manga-lists/${options[1]}/${category}/${options[0]}/${page}.html`
            }
            let res = await Network.get(url, {
                // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                // "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                // "Host": "www.yydsmh.com",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                // "Referer": "https://www.yydsmh.com/",
                // "Accept-Encoding": "gzip, deflate",
                // "Connection": "keep-alive",
                // "Pragma": "no-cache",
                // "Cache-Control": "no-cache",
                // "Cookie": "PHPSESSID=5a8e7f3b2c1d0e9f8a7b6c5d4e3f2g1h; _fw_crm_v=6e3a8b2f-4c7d-4e9a-b2f8-7d5e6f3a2b1c; first_session=%7B%22visits%22%3A5%2C%22start%22%3A1751504104903%2C%22last_visit%22%3A1751511120790%2C%22url%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2Fuser%2Findex%22%2C%22path%22%3A%22%2Fuser%2Findex%22%2C%22referrer%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2F%22%2C%22referrer_info%22%3A%7B%22host%22%3A%22www.yydsmh.com%22%2C%22path%22%3A%22%2F%22%2C%22protocol%22%3A%22http%3A%22%2C%22port%22%3A80%2C%22search%22%3A%22%22%2C%22query%22%3A%7B%7D%7D%2C%22search%22%3A%7B%22engine%22%3Anull%2C%22query%22%3Anull%7D%2C%22prev_visit%22%3A1751504340089%2C%22time_since_last_visit%22%3A6780701%2C%22version%22%3A0.4%7D; articlevisited=1; Expires=Fri, 31 Dec 2025 23:59:59 GMT; Max-Age=63072000"
            })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)

            function parseComic(element) {
                let title = element.querySelector("p.title").text
                let cover = element.querySelector("img").attributes["src"]
                let tags = []
                let link = element.querySelector("a").attributes["href"]
                let updateInfo = element.querySelector("span.chapter").text
                return {
                    title: title,
                    cover: cover,
                    tags: tags,
                    id: link,
                    subTitle: updateInfo
                };
            }
            function filterComic(element) {
                let cover = element.querySelector("img").attributes["src"]
                if (cover.includes('9mh') ||  cover.includes('doushou') ||  cover.includes('boylove')) {
                    return false
                }
                return true
            }
            let query = 'ul.comic-sort > li'
            if (param !== undefined && param !== null) {
                query = 'ul.update-list > li'
            }
            let maxPage = null
            return {
                comics: document.querySelectorAll(query).filter(filterComic).map(parseComic),
                maxPage: maxPage
            }
        },
        // 提供选项
        optionList: [
            {
                // 对于单个选项, 使用-分割, 左侧为用于数据加载的值, 即传给load函数的options参数; 右侧为显示给用户的文本
                options: [
                    "3-全部",
                    "4-连载中",
                    "1-已完结",
                ],
                // 提供[]string, 当分类名称位于此数组中时, 禁用此选项
                notShowWhen: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
                // 提供[]string, 当分类名称没有位于此数组中时, 禁用此选项
                showWhen: null
            },
            {
                // 对于单个选项, 使用-分割, 左侧为用于数据加载的值, 即传给load函数的options参数; 右侧为显示给用户的文本
                options: [
                    "9-全部",
                    "1-日漫",
                    "2-港台",
                    "3-美漫",
                    "4-国漫",
                    "5-韩漫",
                    "6-未分类"
                ],
                // 提供[]string, 当分类名称位于此数组中时, 禁用此选项
                notShowWhen: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
                // 提供[]string, 当分类名称没有位于此数组中时, 禁用此选项
                showWhen: null
            },
        ],
    }

    /// 搜索
    search = {
        load: async (keyword, options, page) => {
            let res = await Network.get(`https://www.yydsmh.com/api/front/index/search?key=${encodeURIComponent(keyword)}`, {
                    // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    // "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                    // "Host": "www.yydsmh.com",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                    // "Referer": "https://www.yydsmh.com/",
                    // "Accept-Encoding": "gzip, deflate",
                    // "Connection": "keep-alive",
                    // "Pragma": "no-cache",
                    // "Cache-Control": "no-cache",
                    // "Cookie": "PHPSESSID=5a8e7f3b2c1d0e9f8a7b6c5d4e3f2g1h; _fw_crm_v=6e3a8b2f-4c7d-4e9a-b2f8-7d5e6f3a2b1c; first_session=%7B%22visits%22%3A5%2C%22start%22%3A1751504104903%2C%22last_visit%22%3A1751511120790%2C%22url%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2Fuser%2Findex%22%2C%22path%22%3A%22%2Fuser%2Findex%22%2C%22referrer%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2F%22%2C%22referrer_info%22%3A%7B%22host%22%3A%22www.yydsmh.com%22%2C%22path%22%3A%22%2F%22%2C%22protocol%22%3A%22http%3A%22%2C%22port%22%3A80%2C%22search%22%3A%22%22%2C%22query%22%3A%7B%7D%7D%2C%22search%22%3A%7B%22engine%22%3Anull%2C%22query%22%3Anull%7D%2C%22prev_visit%22%3A1751504340089%2C%22time_since_last_visit%22%3A6780701%2C%22version%22%3A0.4%7D; articlevisited=1; Expires=Fri, 31 Dec 2025 23:59:59 GMT; Max-Age=63072000"
            })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
   

            let json = JSON.parse(res.body)
            let data = []
            if (json["code"] === "0" || json["code"] === 0) {
                data = json["data"]
            } 

            function parseComic(element) {
                let title = element.name
                let cover = element.cover
                let link = element.info_url
                let updateInfo = element.lastupdate_cn
                return {
                    title: title,
                    cover: cover,
                    id: link,
                    subTitle: updateInfo
                };
            }
            function filterComic(element) {
                let cover = element.cover
                if (cover.includes('9mh') ||  cover.includes('doushou') ||  cover.includes('boylove')) {
                    return false
                }
                return true
            }

            return {
                comics: data.filter(filterComic).map(parseComic),
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
                    // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    // "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                    // "Host": "www.yydsmh.com",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                    // "Referer": "https://www.yydsmh.com/",
                    // "Accept-Encoding": "gzip, deflate",
                    // "Connection": "keep-alive",
                    // "Pragma": "no-cache",
                    // "Cache-Control": "no-cache",
                    // "Cookie": "PHPSESSID=5a8e7f3b2c1d0e9f8a7b6c5d4e3f2g1h; _fw_crm_v=6e3a8b2f-4c7d-4e9a-b2f8-7d5e6f3a2b1c; first_session=%7B%22visits%22%3A5%2C%22start%22%3A1751504104903%2C%22last_visit%22%3A1751511120790%2C%22url%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2Fuser%2Findex%22%2C%22path%22%3A%22%2Fuser%2Findex%22%2C%22referrer%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2F%22%2C%22referrer_info%22%3A%7B%22host%22%3A%22www.yydsmh.com%22%2C%22path%22%3A%22%2F%22%2C%22protocol%22%3A%22http%3A%22%2C%22port%22%3A80%2C%22search%22%3A%22%22%2C%22query%22%3A%7B%7D%7D%2C%22search%22%3A%7B%22engine%22%3Anull%2C%22query%22%3Anull%7D%2C%22prev_visit%22%3A1751504340089%2C%22time_since_last_visit%22%3A6780701%2C%22version%22%3A0.4%7D; articlevisited=1; Expires=Fri, 31 Dec 2025 23:59:59 GMT; Max-Age=63072000"
                });
                if (comicInfoRes.status !== 200) {
                    throw "Invalid status code: " + res.status
                }
                let document = new HtmlDocument(comicInfoRes.body)
                let name = document.querySelector("h1").text;
                let res = await Network.post("https://www.yydsmh.com/api/user/bookcase/add", {
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
                let res = await Network.post("https://www.yydsmh.com/api/user/bookcase/del", {
                    // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    // "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                    // "Host": "www.yydsmh.com",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                    // "Referer": "https://www.yydsmh.com/",
                    // "Accept-Encoding": "gzip, deflate",
                    // "Connection": "keep-alive",
                    // "Pragma": "no-cache",
                    // "Cache-Control": "no-cache",
                    // "Cookie": "PHPSESSID=5a8e7f3b2c1d0e9f8a7b6c5d4e3f2g1h; _fw_crm_v=6e3a8b2f-4c7d-4e9a-b2f8-7d5e6f3a2b1c; first_session=%7B%22visits%22%3A5%2C%22start%22%3A1751504104903%2C%22last_visit%22%3A1751511120790%2C%22url%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2Fuser%2Findex%22%2C%22path%22%3A%22%2Fuser%2Findex%22%2C%22referrer%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2F%22%2C%22referrer_info%22%3A%7B%22host%22%3A%22www.yydsmh.com%22%2C%22path%22%3A%22%2F%22%2C%22protocol%22%3A%22http%3A%22%2C%22port%22%3A80%2C%22search%22%3A%22%22%2C%22query%22%3A%7B%7D%7D%2C%22search%22%3A%7B%22engine%22%3Anull%2C%22query%22%3Anull%7D%2C%22prev_visit%22%3A1751504340089%2C%22time_since_last_visit%22%3A6780701%2C%22version%22%3A0.4%7D; articlevisited=1; Expires=Fri, 31 Dec 2025 23:59:59 GMT; Max-Age=63072000"
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
            let res = await Network.post("https://www.yydsmh.com/api/user/bookcase/ajax", {
                    // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    // "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                    // "Host": "www.yydsmh.com",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                    // "Referer": "https://www.yydsmh.com/",
                    // "Accept-Encoding": "gzip, deflate",
                    // "Connection": "keep-alive",
                    // "Pragma": "no-cache",
                    // "Cache-Control": "no-cache",
                    // "Cookie": "PHPSESSID=5a8e7f3b2c1d0e9f8a7b6c5d4e3f2g1h; _fw_crm_v=6e3a8b2f-4c7d-4e9a-b2f8-7d5e6f3a2b1c; first_session=%7B%22visits%22%3A5%2C%22start%22%3A1751504104903%2C%22last_visit%22%3A1751511120790%2C%22url%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2Fuser%2Findex%22%2C%22path%22%3A%22%2Fuser%2Findex%22%2C%22referrer%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2F%22%2C%22referrer_info%22%3A%7B%22host%22%3A%22www.yydsmh.com%22%2C%22path%22%3A%22%2F%22%2C%22protocol%22%3A%22http%3A%22%2C%22port%22%3A80%2C%22search%22%3A%22%22%2C%22query%22%3A%7B%7D%7D%2C%22search%22%3A%7B%22engine%22%3Anull%2C%22query%22%3Anull%7D%2C%22prev_visit%22%3A1751504340089%2C%22time_since_last_visit%22%3A6780701%2C%22version%22%3A0.4%7D; articlevisited=1; Expires=Fri, 31 Dec 2025 23:59:59 GMT; Max-Age=63072000"
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
                    id: "https://www.yydsmh.com" + e["info_url"]
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
            let res = await Network.get(`https://www.yydsmh.com${id}`, {
                    // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    // "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                    // "Host": "www.yydsmh.com",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                    // "Referer": "https://www.yydsmh.com/",
                    // "Accept-Encoding": "gzip, deflate",
                    // "Connection": "keep-alive",
                    // "Pragma": "no-cache",
                    // "Cache-Control": "no-cache",
                    // "Cookie": "PHPSESSID=5a8e7f3b2c1d0e9f8a7b6c5d4e3f2g1h; _fw_crm_v=6e3a8b2f-4c7d-4e9a-b2f8-7d5e6f3a2b1c; first_session=%7B%22visits%22%3A5%2C%22start%22%3A1751504104903%2C%22last_visit%22%3A1751511120790%2C%22url%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2Fuser%2Findex%22%2C%22path%22%3A%22%2Fuser%2Findex%22%2C%22referrer%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2F%22%2C%22referrer_info%22%3A%7B%22host%22%3A%22www.yydsmh.com%22%2C%22path%22%3A%22%2F%22%2C%22protocol%22%3A%22http%3A%22%2C%22port%22%3A80%2C%22search%22%3A%22%22%2C%22query%22%3A%7B%7D%7D%2C%22search%22%3A%7B%22engine%22%3Anull%2C%22query%22%3Anull%7D%2C%22prev_visit%22%3A1751504340089%2C%22time_since_last_visit%22%3A6780701%2C%22version%22%3A0.4%7D; articlevisited=1; Expires=Fri, 31 Dec 2025 23:59:59 GMT; Max-Age=63072000"
                })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)

            let title = document.querySelector('meta[property="og:novel:book_name"]').attributes["content"]
            let cover = document.querySelector('meta[property="og:image"]').attributes["content"]
            let author = document.querySelector('meta[property="og:novel:author"]').attributes["content"]
            let tags = document.querySelector('meta[property="og:novel:category"]').attributes["content"].split(',').map(res => res.trim()).filter(res => res.length > 0)
            let description = document.querySelector('meta[property="og:description"]').attributes["content"]
            let updateTime = document.querySelector('meta[property="og:novel:update_time"]').attributes["content"]

            let chapters = new Map()
            for(let c of document.querySelectorAll('.chapter-list .comic-chapter-item .comic-chapter-link')) {
                let epId = c.attributes['href']
                chapters.set(`.${epId}`, c.text.trim())
            }
            let recommend = []
            let  recommendQ =  document.querySelector('.recommend-box .mult.sow')
            for(let e of recommendQ.querySelectorAll('.card')) {
                // if (this.filterComic(e)) { continue }
                recommend.push(this.parseComic(e))
            }
            return {
                title: title,
                cover: cover,
                description: description,
                tags: {
                    "作者": [author],
                    "更新": [updateTime],
                    "标签": tags
                },
                chapters: chapters,
                recommend: recommend
            }
        },
        onClickTag: (namespace, tag) => {
            if(namespace == "标签"){
                return {
                    // 'search' or 'category'
                    action: 'category',
                    keyword: `${tag}`,
                    // {string?} only for category action
                    param: null,
                }
            }
            if(namespace == "作者"){
                return {
                    // 'search' or 'category'
                    action: 'search',
                    keyword: `${tag}`,
                    // {string?} only for category action
                    param: null,
                }
            }
            throw "未支持此类Tag检索"
        },
        // 获取章节图片
        loadEp: async (comicId, epId) => {
            let id = epId.substring(1);
            let res = await Network.get(
                `https://www.yydsmh.com${id}`,
                {
                    // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    // "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                    // "Host": "www.yydsmh.com",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                    // "Referer": "https://www.yydsmh.com/",
                    // "Accept-Encoding": "gzip, deflate",
                    // "Connection": "keep-alive",
                    // "Pragma": "no-cache",
                    // "Cache-Control": "no-cache",
                    // "Cookie": "PHPSESSID=5a8e7f3b2c1d0e9f8a7b6c5d4e3f2g1h; _fw_crm_v=6e3a8b2f-4c7d-4e9a-b2f8-7d5e6f3a2b1c; first_session=%7B%22visits%22%3A5%2C%22start%22%3A1751504104903%2C%22last_visit%22%3A1751511120790%2C%22url%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2Fuser%2Findex%22%2C%22path%22%3A%22%2Fuser%2Findex%22%2C%22referrer%22%3A%22http%3A%2F%2Fwww.yydsmh.com%2F%22%2C%22referrer_info%22%3A%7B%22host%22%3A%22www.yydsmh.com%22%2C%22path%22%3A%22%2F%22%2C%22protocol%22%3A%22http%3A%22%2C%22port%22%3A80%2C%22search%22%3A%22%22%2C%22query%22%3A%7B%7D%7D%2C%22search%22%3A%7B%22engine%22%3Anull%2C%22query%22%3Anull%7D%2C%22prev_visit%22%3A1751504340089%2C%22time_since_last_visit%22%3A6780701%2C%22version%22%3A0.4%7D; articlevisited=1; Expires=Fri, 31 Dec 2025 23:59:59 GMT; Max-Age=63072000"
                }
            )
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            return {
                images: document.querySelectorAll("#imgsec .item img").map(e => e.attributes["data-src"])
            }
        },
        onImageLoad: (url, comicId, epId) => {
            return {
                url: url,
                headers: {
                    "Referer": "https://www.yydsmh.com/",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
                }
            }
        },
        onThumbnailLoad: (url) => {
            return {
                url: url,
                headers: {
                    "Referer": "https://www.yydsmh.com/",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
                }
            }
        },
        /// 警告: 这是历史遗留问题, 对于新的漫画源, 不应当使用此字段, 在选取漫画id时, 不应当出现特殊字符
        matchBriefIdRegex: "https://www.yydsmh.com/(\\d+)/"
    }
}
