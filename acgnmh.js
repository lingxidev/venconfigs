class NewComicSource extends ComicSource {  // 首行必须为class...

    // 此漫画源的名称
    name = "怀旧漫画"

    // 唯一标识符
    key = "acgnmh"

    version = "1.0.0"

    minAppVersion = "1.0.0"

    description = '怀旧漫画很全'

    // 更新链接
    url = "https://github.com/lingxidev/venconfigs/blob/main/acgnmh.js"

    /// APP启动时或者添加/更新漫画源时执行此函数
    init() {

    }

    /// 账号
    /// 设置为null禁用账号功能
    account = {
        /// 登录
        /// 返回任意值表示登录成功
        login: async (account, pwd) => {
            let res = await Network.post("https://comic.acgn.cc/api/user/userarr/login", {
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
            Network.deleteCookies("ymcdnyfqdapp.qmwmh.com")
        },

        registerWebsite: "https://comic.acgn.cc/user/register/"
    }
    parseComic(element) {
        let id = element.querySelector("a").attributes["href"]
        let title = element.querySelector(".title").text
        let cover = element.querySelector('.thumb_img').attributes['data-src']
        return {
            id: id,
            title: title,
            cover: cover,
            tags: [],
            description: ''
        }
    }
    filterComic(e) {
        let cover = e.querySelector(".card-graph > img").attributes["src"]
        if (cover.includes('9mh') ||  cover.includes('doushou') ||  cover.includes('boylove')) {
            return false
        }
        return true
    }
    formateData(timestamp){
        const date = new Date(timestamp * 1000); // 转换为毫秒
        // 获取各个日期时间部分
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        // 组合成 YYYY-MM-dd HH:mm:ss 格式
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDate
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
                let url = "https://comic.acgn.cc/cate-1.htm"
                let res = await Network.get(url, {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                })
                if (res.status !== 200) {
                    throw "Invalid status code: " + res.status
                }
                let document = new HtmlDocument(res.body)

                function parseComic(element) {
                    let id = element.querySelector('.list_r a').attributes['href']
                    let title = element.querySelector('.list_l a').attributes['title'].trim()
                    let subTitle = element.querySelector('.list_l .last').text.trim()
                    let cover = 'https://comic.acgn.cc' + element.querySelector('.list_l a img').attributes['src']
                    return {
                        id: id,
                        title: title,
                        subTitle: subTitle,
                        cover: cover,
                        tags: [],
                        description: ''
                    }
                }

                let comics = document.querySelectorAll(".list2 li").map(e => parseComic(e))
                let result = {}
                let title = '热门漫画,精彩继续'
                result[title] = comics;
                return result
            }
        }
    ]

    /// 分类页面
    /// 一个漫画源只能有一个分类页面, 也可以没有, 设置为null禁用分类页面
    category = {
        /// 标题, 同时为标识符, 不能与其他漫画源的分类页面重复
        title: "怀旧漫画",
        parts: [
            {
                name: "分类",

                // fixed 或者 random
                // random用于分类数量相当多时, 随机显示其中一部分
                type: "fixed",

                // 如果类型为random, 需要提供此字段, 表示同时显示的数量
                // randomNumber: 5,
                // categories: ["全部", "热血", "玄幻", "恋爱","冒险", "古风", "都市", "穿越", "奇幻", "其他", "搞笑", "少男", "战斗", "重生", "逆袭", "爆笑", "少年", "后宫", "系统", "BL", "韩漫", "完整版",  "台版"],
                categories: ["全部"],

                // category或者search
                // 如果为category, 点击后将进入分类漫画页面, 使用下方的`categoryComics`加载漫画
                // 如果为search, 将进入搜索页面
                itemType: "category",
                // 若提供, 数量需要和`categories`一致, `categoryComics.load`方法将会收到此参数
                // categoryParams: ["", "热血", "玄幻", "恋爱","冒险", "古风", "都市", "穿越", "奇幻", "其他", "搞笑", "少男", "战斗", "重生", "逆袭", "爆笑", "少年", "后宫", "系统", "BL", "韩漫", "完整版",  "台版"]
                categoryParams: [""]
            },
            // {
            //     name: "更新",

            //     // fixed 或者 random
            //     // random用于分类数量相当多时, 随机显示其中一部分
            //     type: "fixed",

            //     // 如果类型为random, 需要提供此字段, 表示同时显示的数量
            //     // randomNumber: 5,

            //     categories: ["全部", "连载中", "已完结"],

            //     // category或者search
            //     // 如果为category, 点击后将进入分类漫画页面, 使用下方的`categoryComics`加载漫画
            //     // 如果为search, 将进入搜索页面
            //     itemType: "category",
            //     // 若提供, 数量需要和`categories`一致, `categoryComics.load`方法将会收到此参数
            //     categoryParams: ['-1', '0', '1']
            // },
            // {
            //     name: "排序",

            //     // fixed 或者 random
            //     // random用于分类数量相当多时, 随机显示其中一部分
            //     type: "fixed",

            //     // 如果类型为random, 需要提供此字段, 表示同时显示的数量
            //     // randomNumber: 5,

            //     categories: [ "更新", "新作", "畅销", "热门"],

            //     // category或者search
            //     // 如果为category, 点击后将进入分类漫画页面, 使用下方的`categoryComics`加载漫画
            //     // 如果为search, 将进入搜索页面
            //     itemType: "category",
            //     // 若提供, 数量需要和`categories`一致, `categoryComics.load`方法将会收到此参数
            //     categoryParams: ['0', '1', '2','3']
            // },
            // {
            //     name: "日期",
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
            let url = "https://comic.acgn.cc/cate/xuanhuan"
            let res = await Network.get(url, {
                "Referer": "https://mhtmh.org/cate/",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            let comics = document.querySelectorAll(".bm-box .books-rows .item").map(e => this.parseComic(e))
            let maxPage = 1
            return {
                comics: [],
                maxPage: maxPage
            }
        },
        // 提供选项
        optionList: [
            // {
            //     // 对于单个选项, 使用-分割, 左侧为用于数据加载的值, 即传给load函数的options参数; 右侧为显示给用户的文本
            //     options: [
            //         "100-全部",
            //         "0-连载中",
            //         "1-已完结",
            //     ],
            // },
            // {
            //     // 对于单个选项, 使用-分割, 左侧为用于数据加载的值, 即传给load函数的options参数; 右侧为显示给用户的文本
            //     options: [
            //         "1-星期一",
            //         "2-星期二",
            //         "3-星期三",
            //         "4-星期四",
            //         "5-星期五",
            //         "6-星期六",
            //         "7-星期日"
            //     ],
            // },
            // {
            //     // 对于单个选项, 使用-分割, 左侧为用于数据加载的值, 即传给load函数的options参数; 右侧为显示给用户的文本
            //     options: [
            //         "0-更新",
            //         "1-新作",
            //         "2-畅销",
            //         "3-热门"
            //     ],
            // },
        ],
    }

    /// 搜索
    search = {
          load: async (keyword, options, page) => {
            let homeRes = await Network.get(`https://comic.acgn.cc/cate-1.htm`, {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            })
            if (homeRes.status !== 200) {
                throw "Invalid status code: " + homeRes.status
            }
            let homeDocument = new HtmlDocument(homeRes.body)
            var action = homeDocument.querySelector('#searchbox form').attributes['action']
            const inputs = homeDocument.querySelectorAll('#searchbox p input');
            const params = inputs.filter(input => input.attributes['value'] && input.attributes['value'].trim() !== '').map(input => {
                const name = encodeURIComponent(input.attributes['name']);
                const value = encodeURIComponent(input.attributes['value']); 
                return `${name}=${value}`;
            }).join('&');
            // https://comic.acgn.cc/searchcse?cx=008124722090293425135%3Ai6inzsizmqg&cof=FORID%3A11&ie=UTF-8&q=%E5%A4%A9%E5%AD%90%E4%BC%A0%E5%A5%87&sa=%E6%90%9C%E5%B0%8B
            // 'cx=008124722090293425135%3Ai6inzsizmqg&cof=FORID%3A11&ie=UTF-8&q=&sa=%E6%90%9C%E5%B0%8B'
            // let res = await Network.get(`https://comic.acgn.cc${action}?${params}&q=${encodeURIComponent(keyword)}`, {
            //     "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            // })
            let res = await InAppOpen.load(
                `https://comic.acgn.cc${action}?${params}&q=${encodeURIComponent(keyword)}`,
                {
                    "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
                },
                "document.documentElement.outerHTML;"
            );
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            
            let list = document.querySelectorAll('.gsc-wrapper .gsc-result')
            function parseComic(element) {
                let title = element.querySelector('a.gs-title').text.trim()
                let cover = element.querySelector('img').attributes['src']
                let id = element.querySelector('a.gs-title').attributes['data-ctorig']
                let subTitle = ''
                return {
                    title: title,
                    cover: cover,
                    id: id,
                    subTitle: subTitle
                };
            }
            return {
                comics: list.map(parseComic),
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
                let res = await Network.post("https://comic.acgn.cc/api/user/bookcase/add", {
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
                let res = await Network.post("https://comic.acgn.cc/api/user/bookcase/del", {
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
            let res = await Network.post("https://comic.acgn.cc/api/user/bookcase/ajax", {
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
                    id: "https://comic.acgn.cc" + e["info_url"]
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
            let res = await Network.get(id, {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            let title = document.querySelector('.box_info2 dd:last-child em').text
            let description = document.querySelector('.box_info2 dd:last-child').text
            let cover = 'https://comic.acgn.cc' + document.querySelector('.box_info2 a img').attributes['src']

            let lis = document.querySelectorAll('.load01_r li')
            let tags = {}
            for(let li of lis) {
                let tag = li.text.trim().split('：')
                tags[tag[0]] = [tag[1]]
            }

            let chapters = new Map()
            for(let c of document.querySelectorAll('#comic_chapter li a')) {
                let epId = c.attributes['href']
                let title = c.text.trim();
                //下载路径第一位不能是/
                chapters.set(`${epId}`,title)
            }
            return {
                title: title,
                cover: cover,
                description: description,
                tags: tags,
                chapters: chapters,
            }
        },
        // 获取章节图片
        loadEp: async (comicId, epId) => {
            let res = await Network.get(
                `https://comic.acgn.cc/${epId}`,
                {
                    "Referer": `${comicId}`,
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }
            )
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            let images = document.querySelectorAll('#pic_list .pic').map(res => res.attributes['_src'])
            return {
                images: images
            }
        },
        onImageLoad: (url, comicId, epId) => {
            return {
                url: url,
                headers: {
                    "Referer": "https://comic.acgn.cc/",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }
            }
        },
        onThumbnailLoad: (url) => {
            return {
                url: url,
                headers: {
                    "Referer": "https://comic.acgn.cc/",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }
            }
        },
        /// 警告: 这是历史遗留问题, 对于新的漫画源, 不应当使用此字段, 在选取漫画id时, 不应当出现特殊字符
        matchBriefIdRegex: "https://comic.acgn.cc/(\\d+)/"
    }
}
