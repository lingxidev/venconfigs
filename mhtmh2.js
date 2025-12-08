class NewComicSource extends ComicSource {  // 首行必须为class...

    // 此漫画源的名称
    name = "桃子漫画"

    // 唯一标识符
    key = "mhtmh"

    version = "2.0.6"

    minAppVersion = "1.0.0"

    description = '韩漫很全'

    // 更新链接
    url = "https://github.com/lingxidev/venconfigs/blob/main/mhtmh2.js"

    /// APP启动时或者添加/更新漫画源时执行此函数
    init() {

    }

    /// 账号
    /// 设置为null禁用账号功能
    account = {
        /// 登录
        /// 返回任意值表示登录成功
        login: async (account, pwd) => {
            let res = await Network.post("https://www.mwai.cc/api/user/userarr/login", {
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

        registerWebsite: "https://www.mwai.cc/user/register/"
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
                let url = "https://www.mwai.cc/cate/hotblooded/"
                let res = await Network.get(url, {
                    "Referer": "https://www.mwai.cc/cate/",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                })
                if (res.status !== 200) {
                    throw "Invalid status code: " + res.status
                }
                let document = new HtmlDocument(res.body)
                let comics = document.querySelectorAll(".bm-box .books-row .item").map(e => this.parseComic(e))
                // let res = await Network.get("https://www.mwai.cc/", {
                //     "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                // })
                // if (res.status !== 200) {
                //     throw "Invalid status code: " + res.status
                // }
                // let maxPage = 1
                // let document = new HtmlDocument(res.body)
                // let parts = document.querySelectorAll('.bm-box')
                // let result = {}
                // let index = 0;
                // for (let part of parts) {
                //     if (index > 0){
                //         break;
                //     }
                //     index++;
                //     let title = part.querySelector(".bm-box__head .title").text.trim()
                //     title = title.replace('登录观看更精彩','精彩继续')
                //     let comics = part.querySelectorAll(".books-row .item").filter(e => {
                //          let title = e.querySelector(".title").text
                //          if (title.includes('台版')){
                //              return false
                //          }
                //          return true
                //     }).map(e => this.parseComic(e))
                //     if (title == '热门收藏漫画'){
                //         continue;
                //     }
                //     if(comics.length > 0) {
                //         result[title] = comics
                //     }
                // } 
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
        title: "桃子漫画",
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
            let url = "https://www.mwai.cc/cate/xuanhuan"
            let res = await Network.get(url, {
                "Referer": "https://www.mwai.cc/cate/",
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
            let res = await Network.get(`https://www.mwai.cc/api/search?keyword=${encodeURIComponent(keyword)}&type=mh&page=1&pageSize=3`, {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
   
            let body = JSON.parse(res.body)
            if (body["code"] != 200) {
                throw "Invalid response: " + body["msg"]
            }
            let data =  body["data"]
            let that = this
            function parseComic(element) {
                let title = element.title
                let cover = element.cover
                let id = element.url
                let subTitle = element.author
                return {
                    title: title,
                    cover: cover,
                    id: id,
                    subTitle: subTitle,
                    tags: element.tags.split(','),
                    whiteList: ['相克 (完整版)','北部大公的秘密契约 (完整版)','被驯服的虎 (完整版)','家族荣誉之士麦那&amp;卡普里 (完整版)','要结婚的男人 (完整版)','谁把谁当真','迷弟保镖 (完整版)','要结婚的男人 (完整版)','Plaything 某位大公阁下的玩物 (台版)','ShutLine：驭险谜情 (台版)','Honey Bear (完整版)','亲爱的,泰迪熊 (完整版)',"Driver's high (台版)",'Plaything成为某大公阁下的玩物 (完整版)']
                };
            }
            let blackTagList = ['全彩'];
            let blackTitleList = this.loadSetting('search_api') === "baseAPI" ? ['台版'] : [];
            function filterComic(element) {
                let cover = element.cover
                let show = true
                if (element.description.includes('H漫线上看') || element.description.includes('http')) {
                    show = false
                }
                blackTagList.forEach(res => {
                    if (element.tags.includes(res)){
                        show = false
                    }
                    if (element.title.includes(res)){
                        show = false
                    }
                })
                blackTitleList.forEach(res => {
                    if (element.title.includes(res)){
                        show = false
                    }
                })
                return show
            }

            return {
                comics: data.list.filter(filterComic).map(parseComic),
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
                let res = await Network.post("https://www.mwai.cc/api/user/bookcase/add", {
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
                let res = await Network.post("https://www.mwai.cc/api/user/bookcase/del", {
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
            let res = await Network.post("https://www.mwai.cc/api/user/bookcase/ajax", {
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
                    id: "https://www.mwai.cc" + e["info_url"]
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
            if (!id.includes('comic')) {
                id = `/comic/${id}`
            }
            let res = await Network.get(`https://www.mwai.cc${id}`, {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)

            let infoRes = await Network.get(`https://www.mwai.cc/api${id}`, {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                })
            if (infoRes.status !== 200) {
                throw "Invalid status code: " + infoRes.status
            }
            let body = JSON.parse(infoRes.body)
            let data =  body["data"]
            let cover = data.cover;
            let updateTime = this.formateData(data.editTime)
            
            let title = data.title.trim();
            let author = document.querySelectorAll('.comic-meta div')[0].querySelector('#author').text
            let status = data.status == 1 ? '连载中' : '已完结'
            let tags = []
            let description = document.querySelector('.comic-desc').text
            if (description.includes('H漫线上看') || description.includes('http')){
                description = '暂无描述'
            }
       
            let chapters = new Map()
            let isBase = this.loadSetting('search_api') === "baseAPI";
            for(let c of document.querySelectorAll('#chapter-grid-container .chapter-item')) {
                let epId = c.attributes['href']
                let picCount = c.querySelector('.chapter-meta span').text.split(' ')[0]
                let title = c.querySelector('.chapter-name').text.trim();
                if (title.includes('无码')){
                    continue;
                }
                //下载路径第一位不能是/
                chapters.set(`.${epId}_${picCount}`,title)
            }
            return {
                title: title,
                cover: cover,
                description: description,
                tags: {
                    "作者": [author],
                    "更新": [updateTime],
                    "状态": [status],
                    "标签": []
                },
                chapters: chapters,
            }
        },
        // 获取章节图片
        loadEp: async (comicId, epId) => {
            let ep = epId.split('_')[0]
            let id = ep.split('/').pop()
            let picCount = epId.split('_')[1]
            let imageSource = this.loadSetting('image_source');
            let res = await Network.get(
                `https://www.mwai.cc/api/comic/image/${id}?page=1&page_size=${picCount}&image_source=${imageSource}`,
                {
                    "Referer": `https://www.mwai.cc/comic/${comicId}/${ep}`,
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }
            )
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let body = JSON.parse(res.body)
            if (body["code"] != 200) {
                throw "Invalid response: " + body["msg"]
            }
            let data =  body["data"]
            return {
                images: data.images.map(res => res.url)
            }
        },
        onImageLoad: (url, comicId, epId) => {
            return {
                url: url,
                headers: {
                    "Referer": "https://www.mwai.cc/",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }
            }
        },
        onThumbnailLoad: (url) => {
            return {
                url: url,
                headers: {
                    "Referer": "https://www.mwai.cc/",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }
            }
        },
        /// 警告: 这是历史遗留问题, 对于新的漫画源, 不应当使用此字段, 在选取漫画id时, 不应当出现特殊字符
        matchBriefIdRegex: "https://www.mwai.cc/(\\d+)/"
    }
    settings = { 
        search_api: {
            title: "搜索方式",
            type: "select",
            options: [
            {
                value: 'baseAPI',
                text: '基础'
            },
            {
                value: 'webAPI',
                text: '网页'
            }
            ],
            default: 'baseAPI'
        },
        image_source: {
            title: "图源",
            type: "select",
            options: [
            {
                value: 'https://tu.mihoutao.vip',
                text: 'stable'
            },
            {
                value: 'https://tu.mhttu.cc',
                text: 'high'
            },
            {
                value: 'https://by.mihoutao.vip',
                text: 'standby'
            }
            ],
            default: 'https://tu.mhttu.cc'
        }
    }
}
