class NewComicSource extends ComicSource {  // 首行必须为class...

    // 此漫画源的名称
    name = "新一漫画"

    // 唯一标识符
    key = "myComic"

    version = "1.0.0"

    minAppVersion = "1.0.0"

    // 更新链接
    url = "https://github.com/lingxidev/venconfigs/blob/main/myComic.js"

    /// APP启动时或者添加/更新漫画源时执行此函数
    init() {

    }

    /// 账号
    /// 设置为null禁用账号功能
    account = {
        /// 登录
        /// 返回任意值表示登录成功
        login: async (account, pwd) => {
            let res = await Network.post("https://mycomic.com/cn/api/user/userarr/login", {
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

        registerWebsite: "https://mycomic.com/cn/user/register/"
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
                // let res = await Network.get("https://mycomic.com/cn", {
                //     "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                // })
                let res = await InAppOpen.load(
                    `https://mycomic.com/cn`,
                    {
                        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                    },
                    'document.documentElement.outerHTML;',
                    {progress: 80}
                )
                if (res.status !== 200) {
                    throw "Invalid status code: " + res.status
                }
        
                let document = new HtmlDocument(res.body)
                let result = {}
                // 获取页面主要部分
                const mainSections = document.querySelectorAll('[class*="grid-area"] > div > div');
                mainSections.forEach(section => {
                    const titleElement = section.querySelector('[data-flux-heading]');
                    const title = titleElement ? titleElement.text.trim() : '精品推荐';
                    if(title != "推荐给你"){
                        const comicsInSection = section.querySelectorAll('.group.relative').map(group => {
                            const imgElement = group.querySelector('img');
                            const titleElement = group.querySelector('[data-flux-subheading]');
                            const linkElement = group.querySelector('a');
                            const chapterElement = group.querySelector('.text-white.text-sm.pb-3.truncate');
                            let cover = imgElement ? imgElement.attributes["src"] : ""
                            if (cover.includes("data:")) {
                                cover = imgElement.attributes["data-src"] || ""
                            }
                            return {
                                title: titleElement ? titleElement.text.trim() : "",
                                cover: cover,
                                id: linkElement ? linkElement.attributes["href"] : "",
                                subTitle: chapterElement ? chapterElement.text.trim() : ""
                            };
                        });
                        if (comicsInSection && comicsInSection.length > 0) {
                            result[title] = comicsInSection
                        }
                    }
                });
                return result
                
            }
        }
    ]

    /// 分类页面
    /// 一个漫画源只能有一个分类页面, 也可以没有, 设置为null禁用分类页面
    category = {
        /// 标题, 同时为标识符, 不能与其他漫画源的分类页面重复
        title: "新一漫画",
        parts: [
            {
                name: "分类",

                // fixed 或者 random
                // random用于分类数量相当多时, 随机显示其中一部分
                type: "fixed",

                // 如果类型为random, 需要提供此字段, 表示同时显示的数量
                // randomNumber: 5,

                categories: ['所有', '魔幻', '魔法', '熱血', '冒險', '懸疑', '偵探', '愛情', '校園', '搞笑', '四格', '科幻', '神鬼', '舞蹈', '音樂', '百合', '後宮', '機戰', '格鬥', '恐怖', '萌系', '武俠', '社會', '歷史', '耽美', '勵志', '職場', '生活', '治癒', '偽娘', '黑道', '戰爭', '競技', '體育', '美食', '腐女', '宅男', '推理', '雜誌'],

                // category或者search
                // 如果为category, 点击后将进入分类漫画页面, 使用下方的`categoryComics`加载漫画
                // 如果为search, 将进入搜索页面
                itemType: "category",
                categoryParams: ['', 'mohuan', 'mofa', 'rexue', 'maoxian', 'xuanyi', 'zhentan', 'aiqing', 'xiaoyuan', 'gaoxiao', 'sige', 'kehuan', 'shengui', 'wudao', 'yinyue', 'baihe', 'hougong', 'jizhan', 'gedou', 'kongbu', 'mengxi', 'wuxia', 'shehui', 'lishi', 'danmei', 'lizhi', 'zhichang', 'shenghuo', 'zhiyu', 'weiniang', 'heidao', 'zhanzheng', 'jingji', 'tiyu', 'meishi', 'funv', 'zhainan', 'tuili', 'zazhi']
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
            let url = 'https://mycomic.com/cn/comics?'
            const queryParams = [];
            if (param == 'author') {
                queryParams.push(`filter%5Bauthor%5D=${category}`);
            }
            if (options[1] != 'all') {
                queryParams.push(`filter%5Bcountry%5D=${options[1]}`);
            }
            if (param != 'author') {
                queryParams.push(`filter%5Btag%5D=${param}`);
            }
            if (options[0] != 'all') {
                queryParams.push(`filter%5Bend%5D=${options[0]}`);
            }
            if (page > 1) {
                queryParams.push(`page=${page}`);
            }
            const queryString = queryParams.join('&');      
            let res = await InAppOpen.load(
                `${url}${queryString}`,
                {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                },
                'document.documentElement.outerHTML;'
            )
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            let comics = document.querySelectorAll(".group")
            function parseComic(element) {
                let title = element.querySelector('div[data-flux-subheading]').text.replace(/\s/g, '').trim()
                let cover = element.querySelector('a img').attributes["src"] || ''
                if (cover.includes("data:")) {
                    cover = element.querySelector('a img').attributes["data-src"] || ''
                }
                let id = element.querySelector('a').attributes["href"]
                let updateInfo = element.querySelector('a div').text.replace(/\s/g, '').trim()
                return {
                    title: title,
                    cover: cover,
                    id: id,
                    subTitle: updateInfo
                }
            }
            let maxPage = null
            return {
                comics: comics.map(parseComic),
                maxPage: maxPage
            }
        },
        // 提供选项
        optionList: [
            {
                // 对于单个选项, 使用-分割, 左侧为用于数据加载的值, 即传给load函数的options参数; 右侧为显示给用户的文本
                options: [
                    "all-全部",
                    "0-连载中",
                    "1-已完结",
                ],
                // 提供[]string, 当分类名称位于此数组中时, 禁用此选项
                notShowWhen: [],
                // 提供[]string, 当分类名称没有位于此数组中时, 禁用此选项
                showWhen: null
            },
            {
                // 对于单个选项, 使用-分割, 左侧为用于数据加载的值, 即传给load函数的options参数; 右侧为显示给用户的文本
                options: [
                    "all-全部",
                    "japan-日漫",
                    "hongkong-港台",
                    "europe-美漫",
                    "china-国漫",
                    "korea-韩漫",
                    "other-未分类"
                ],
                // 提供[]string, 当分类名称位于此数组中时, 禁用此选项
                notShowWhen: [],
                // 提供[]string, 当分类名称没有位于此数组中时, 禁用此选项
                showWhen: null
            },
        ],
    }

    /// 搜索
    search = {
        load: async (keyword, options, page) => {
            // let res = await Network.get(`https://mycomic.com/cn/comics?q=${encodeURIComponent(keyword)}`, {
            //     "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            // })
            let res = await InAppOpen.load(
                `https://mycomic.com/cn/comics?q=${encodeURIComponent(keyword)}`,
                {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                },
                'document.documentElement.outerHTML;'
            )
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            let comics = document.querySelectorAll(".group")
            function parseComic(element) {
                let title = element.querySelector('div[data-flux-subheading]').text.replace(/\s/g, '').trim()
                let cover = element.querySelector('a img').attributes["src"] || ''
                if (cover.includes("data:")) {
                    cover = element.querySelector('a img').attributes["data-src"] || ''
                }
                let id = element.querySelector('a').attributes["href"]
                let updateInfo = element.querySelector('a div').text.replace(/\s/g, '').trim()
                return {
                    title: title,
                    cover: cover,
                    id: id,
                    subTitle: updateInfo
                };
            }
            return {
                comics: comics.map(parseComic),
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
                let res = await Network.post("https://mycomic.com/cn/api/user/bookcase/add", {
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
                let res = await Network.post("https://mycomic.com/cn/api/user/bookcase/del", {
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
            let res = await Network.post("https://mycomic.com/cn/api/user/bookcase/ajax", {
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
                    id: "https://mycomic.com/cn" + e["info_url"]
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
            // let res = await Network.get(`${id}`, {
            //         "Referer" : "https://mycomic.com/cn",
            //         "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            // })
            let res = await InAppOpen.load(
                `${id}`,
                {
                    "Referer" : "https://mycomic.com/cn",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                },
                'document.documentElement.outerHTML;'
            )
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)

            let infoD =  document.querySelector('[class="w-3/4 grow"]');
            let title = infoD.querySelector('[data-flux-heading]').text.trim()
            let cover = infoD.querySelector('img').attributes["src"]
            let description = document.querySelector('meta[property="og:description"]').attributes["content"]
            let tagEelement = document.querySelectorAll('[class="w-3/4 grow"] .grid').filter(res => res.querySelector('label'))[0]
            let tags = {}
            tagEelement.querySelectorAll('div').forEach(res => {
                let key =  res.querySelector('label').text.trim()
                let value = res.querySelector('span').text.trim()
                if (key === '作品类型:') {
                    tags[key] = value.split(',')
                }else {
                    tags[key] = [value]
                }
                tags[key] = [value]
            })
            tags['状态'] = infoD.querySelector('[data-flux-badge]').text.trim()

            let chapterGroup = {}
            document.querySelectorAll('div[x-data]').filter(res => res.attributes["x-data"].includes('chapters')).map(res => {
                let titleD =  res.querySelectorAll('div')[0]
                let title = titleD.querySelector('div').text.trim();
                let chapterMap = {}
                // 方法 2：更安全的方式 - 提取 chapters 部分
                const chaptersMatch = res.attributes["x-data"].match(/chapters:\s*(\[[^\]]+\])/);
                if (chaptersMatch) {
                    try {
                        const chapters = JSON.parse(chaptersMatch[1].replace(/&quot;/g, '"'));
                        chapters.forEach(chapter => {
                            chapterMap[chapter["id"]] = chapter["title"];
                        });
                    } catch (e) {
                        console.error('Error parsing chapters:', e);
                    }
                }
                chapterGroup[title] = chapterMap
                
            })
            let recommend = []
            return {
                title: title,
                cover: cover,
                description: description,
                tags: tags,
                chapters: chapterGroup,
                recommend: recommend
            }
        },
        onClickTag: (namespace, tag) => {
            if(namespace == "原创作者:"){
                return {
                    // 'search' or 'category'
                    action: 'category',
                    keyword: `${tag}`,
                    // {string?} only for category action
                    param: 'author',
                }
            }
            // if(namespace == "作者"){
            //     return {
            //         // 'search' or 'category'
            //         action: 'search',
            //         keyword: `${tag}`,
            //         // {string?} only for category action
            //         param: null,
            //     }
            // }
            throw "未支持此类Tag检索"
        },
        // 获取章节图片
        loadEp: async (comicId, epId) => {
            // let id = epId.substring(1);
            // let res = await Network.get(
            //     `https://mycomic.com/cn${id}`,
            //     {
            //         "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            //     }
            // )
             let res = await InAppOpen.load(
                `https://mycomic.com/cn/chapters/${epId}`,
                {
                    "Referer" : `https://mycomic.com/cn/comics/${comicId}`,
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                },
                'document.documentElement.outerHTML;'
            )
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            console.log(document)
            console.log(document.querySelectorAll('[class*="grid-area"] img[x-ref]'))
            return {
                images: document.querySelectorAll('[class*="grid-area"] img[x-ref]').map(e => {
                    if (e.attributes["src"]) {
                        return e.attributes["src"]
                    }
                    return e.attributes["data-src"]
                })
            }
        },
        onImageLoad: (url, comicId, epId) => {
            return {
                url: url,
                headers: {
                    "Referer": "https://mycomic.com/",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }
            }
        },
        onThumbnailLoad: (url) => {
            return {
                url: url,
                headers: {
                    "Referer": "https://mycomic.com/",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }
            }
        },
        /// 警告: 这是历史遗留问题, 对于新的漫画源, 不应当使用此字段, 在选取漫画id时, 不应当出现特殊字符
        matchBriefIdRegex: "https://mycomic.com/cn/(\\d+)/"
    }
}
