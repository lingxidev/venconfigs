class NewComicSource extends ComicSource {  // 首行必须为class...

    // 此漫画源的名称
    name = "ant漫画"

    // 唯一标识符
    key = "antbyw"

    version = "1.0.1"

    minAppVersion = "1.0.0"

    // 更新链接
    url = "https://github.com/lingxidev/venconfigs/blob/main/antbyw.js"

    /// APP启动时或者添加/更新漫画源时执行此函数
    init() {

    }

    /// 账号
    /// 设置为null禁用账号功能
    account = {
        /// 登录
        /// 返回任意值表示登录成功
        login: async (account, pwd) => {
            let res = await Network.post("https://ymcdnyfqdapp.ikmmh.com/api/user/userarr/login", {
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

        registerWebsite: "https://ymcdnyfqdapp.ikmmh.com/user/register/"
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
                let res = await Network.get("https://www.antbyw.com/plugin.php?id=jameson_manhua&a=ku&odfie=addtime&order=desc", {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                })
                if (res.status !== 200) {
                    throw "Invalid status code: " + res.status
                }
                let document = new HtmlDocument(res.body)
                function parseComicDom(comicDom) {
                    let title = comicDom.querySelector(".image-title").text
                    let cover = comicDom.querySelector(".image-fm > img").attributes["src"]
                    let updateInfo = comicDom.querySelector(".image-summary").text
                    let tags = []
                    let id = comicDom.querySelector("a").attributes["href"]

                    return {
                        title: title,
                        subTitle: updateInfo,
                        cover: cover,
                        tags: tags,
                        id: id
                    };
                }

                let data = {
                    "热门人气新番": document.querySelectorAll(".row.indexrow > div").filter(comicDom => {
                        if (comicDom.querySelector(".image-title")) {
                            return true
                        }
                        return false
                    }).map(parseComicDom),
                }
                
                return data
            }
        }
    ]

    /// 分类页面
    /// 一个漫画源只能有一个分类页面, 也可以没有, 设置为null禁用分类页面
    category = {
        /// 标题, 同时为标识符, 不能与其他漫画源的分类页面重复
        title: "ant漫画",
        parts: [
            {
                name: "分类",

                // fixed 或者 random
                // random用于分类数量相当多时, 随机显示其中一部分
                type: "fixed",

                // 如果类型为random, 需要提供此字段, 表示同时显示的数量
                // randomNumber: 5,

                categories: ['全部', '热血', '冒险', '魔幻', '神鬼', '搞笑', '萌系', '爱情', '科幻', '魔法', '格斗', '武侠', '机战', '战争', '竞技', '体育', '校园', '生活', '励志', '历史', '伪娘', '宅男', '腐女', '耽美', '百合', '后宫', '治愈', '美食', '推理', '悬疑', '恐怖', '四格', '职场', '侦探', '社会', '音乐', '舞蹈', '杂志', '黑道'],

                // category或者search
                // 如果为category, 点击后将进入分类漫画页面, 使用下方的`categoryComics`加载漫画
                // 如果为search, 将进入搜索页面
                itemType: "category",
                categoryParams: ['empty', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44']
            },
            // {
            //     name: "进度",
            //     type: "fixed",
            //     categories: ["全部", "连载中", "已完结"],
            //     itemType: "category",
            //     categoryParams: ['empty', '96', '97']
            // },
            // {
            //     name: "地区",
            //     type: "fixed",
            //     categories: ["全部", "日本", "港台", "其他", "欧美","内地","韩国"],
            //     itemType: "category",
            //     categoryParams: ['empty', '1', '2', '3', '4', '5', '6']
            // },
            // {
            //     name: "受众",
            //     type: "fixed",
            //     categories: ["全部", "少女", "少年", "青年", "通用"],
            //     itemType: "category",
            //     categoryParams: ['empty', '45', '46', '47', '49']
            // }
        ],
        enableRankingPage: false,
    }

    /// 分类漫画页面, 即点击分类标签后进入的页面
    categoryComics = {
        load: async (category, param, options, page) => {
            category = encodeURIComponent(category)
            const queryParams = [];
            if (category != 'empty') {
                queryParams.push(`category_id=${param}`);
            }
            if (options[0] != 'empty') {
                queryParams.push(`jindu=${options[0]}`);
            }
            if (options[1] != 'empty') {
                queryParams.push(`region=${options[1]}`);
            }
            if (options[2] != 'empty') {
                queryParams.push(`shouzhong=${options[2]}`);
            }
            if (page > 1) {
                queryParams.push(`page=${page}`);
            }
            const queryString = queryParams.join('&');

            let url = ""
            url = `https://www.antbyw.com/plugin.php?id=jameson_manhua&a=ku&odfie=addtime&order=asc&${queryString}`
            let res = await Network.get(url, {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            function parseComic(comicDom) {
                let title = comicDom.querySelector(".image-title").text
                let cover = comicDom.querySelector(".image-fm > img").attributes["src"]
                let updateInfo = comicDom.querySelector(".image-summary").text
                let tags = []
                let id = comicDom.querySelector("a").attributes["href"]

                return {
                    title: title,
                    subTitle: updateInfo,
                    cover: cover,
                    tags: tags,
                    id: id
                };
            }
            let maxPage = 1
            if (document.querySelector('.pg .last')) {
                const pageHref = document.querySelector('.pg .last').attributes['href']
                const pageParam = pageHref.split('&').find(param => param.includes('page='));
                // 提取数字部分
                if (pageParam) {
                    const pageNumber = pageParam.split('=')[1]
                    maxPage = parseInt(pageNumber, 10);
                }
            }
            return {
                comics: document.querySelectorAll(".row.indexrow > div").filter(comicDom => {
                    if (comicDom.querySelector(".image-title")) {
                        return true
                    }
                    return false
                }).map(parseComic),
                maxPage: maxPage
            }
        },
        // 提供选项
        optionList: [
            {
                // 对于单个选项, 使用-分割, 左侧为用于数据加载的值, 即传给load函数的options参数; 右侧为显示给用户的文本
                options: [
                    "empty-全部",
                    "96-连载中",
                    "97-已完结",
                ],
                // 提供[]string, 当分类名称位于此数组中时, 禁用此选项
                notShowWhen: [],
                // 提供[]string, 当分类名称没有位于此数组中时, 禁用此选项
                showWhen: null
            },
            {
                // 对于单个选项, 使用-分割, 左侧为用于数据加载的值, 即传给load函数的options参数; 右侧为显示给用户的文本
                options: [
                    "empty-全部",
                    "1-日本",
                    "2-港台",
                    "3-其他",
                    "4-欧美",
                    "5-内地",
                    "6-韩国"
                ],
                // 提供[]string, 当分类名称位于此数组中时, 禁用此选项
                notShowWhen: [],
                // 提供[]string, 当分类名称没有位于此数组中时, 禁用此选项
                showWhen: null
            },
            {
                // 对于单个选项, 使用-分割, 左侧为用于数据加载的值, 即传给load函数的options参数; 右侧为显示给用户的文本
                options: [
                    "empty-全部",
                    "45-少女",
                    "46-少年",
                    "47-青年",
                    "49-通用"
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
            const queryParams = [];
            let url = ""
            let isFromClickAu = keyword.includes('作者')
            if (isFromClickAu) {
                queryParams.push(`zz_name=${encodeURIComponent(keyword.split(":")[1])}`);
                url = `https://www.antbyw.com/plugin.php?id=jameson_manhua&a=mzz`
            }else {
                queryParams.push(`keyword=${encodeURIComponent(keyword)}`);
                url =`https://www.antbyw.com/plugin.php?&id=jameson_manhua&c=index&a=search`
            }
            if (page > 1) {
                queryParams.push(`page=${page}`);
            }
            const queryString = queryParams.join('&');

            let res = await Network.get(`${url}&${queryString}`, {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)

            function parseComic(comicDom) {
                let title = comicDom.querySelector(".item-title").text
                let cover = comicDom.querySelector(".item-media > img").attributes["src"]
                let updateInfo = ''
                if (!isFromClickAu) {
                    updateInfo = comicDom.querySelector(".item-subtitle").querySelector('span:last-child').text.split(':')[1]
                }
                let id = comicDom.querySelector("a").attributes["href"]
                return {
                    title: title,
                    cover: cover,
                    id: id,
                    subTitle: updateInfo
                };
            }

            return {
                comics: document.querySelectorAll(".list-block.media-list > ul li").map(parseComic),
                maxPage: null
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
                let res = await Network.post("https://ymcdnyfqdapp.ikmmh.com/api/user/bookcase/add", {
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
                let res = await Network.post("https://ymcdnyfqdapp.ikmmh.com/api/user/bookcase/del", {
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
            let res = await Network.post("https://ymcdnyfqdapp.ikmmh.com/api/user/bookcase/ajax", {
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
                    id: "https://ymcdnyfqdapp.ikmmh.com" + e["info_url"]
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
            let path =  id.split('?')[1]
            let res = await Network.get('https://www.antbyw.com/plugin.php?' + path, {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            })
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let document = new HtmlDocument(res.body)
            let cover = document.querySelector('.row.content-padded img').attributes["src"]
            let childs =  document.querySelectorAll('.row.content-padded ul li')
            let title = childs[0].querySelector('h4').text
            let bieming = childs[1].querySelector('a').text.split(':')[1]
            let updateLast = childs[2].querySelector('a').text.split(':')[1]
            let updateTime = childs[3].querySelector('a').text.split(':')[1]
            let author = childs[4].querySelector('a').text.split(':')[1]
            let tags = childs[5].querySelectorAll("a").map(e => e.text.trim()).filter(res => res.length > 0)
            let description = document.querySelector('.summary').text.trim()

            // let eps = {}
            // let lis =  document.querySelectorAll('.media-list.zjlist li')
            // lis.forEach((element) => {
            //     //为了拼接下载路径
            //     let id = element.querySelector(".item-link a").attributes["href"]
            //     eps[id] = element.querySelector('.item-title').text.trim()
            // })
            let groupEps = {}
            let tabTitles = document.querySelectorAll('.buttons-tab .tab-link').map(res => res.text.trim())
            let tabLists = document.querySelectorAll('.media-list.zjlist .tab')
            for (let i = 0; i < tabLists.length; i++) {
                 let title = tabTitles[i]
                 let tabList = tabLists[i]
                 let eps = {}
                 tabList.querySelectorAll('li').forEach((element) => {
                    //为了拼接下载路径
                    let id = element.querySelector(".item-link a").attributes["href"]
                    eps[id] = element.querySelector('.item-title').text.trim()
                })
                groupEps[title] = eps 
            }
            let comics = document.querySelectorAll(".row.othercard > div").filter(comicDom => {
                if (comicDom.querySelector(".card-xg-title")) {
                    return true
                }
                return  false
            }).map(element => {
                let title = element.querySelector(".card-xg-title a").text
                let cover = element.querySelector(".card-cover").attributes["src"]
                let id = element.querySelector(".card-xg-fm a").attributes["href"]
                return {
                    title: title,
                    cover: cover,
                    id: id
                }
            })
         
            return {
                title: title,
                cover: cover,
                description: description,
                tags: {
                    "作者": [author],
                    "别名": [bieming],
                    "更新至": [updateLast],
                    "更新时间": [updateTime],
                    "标签": tags
                },
                chapters: groupEps,
                recommend: comics
            }
        },
        // 获取章节图片
        loadEp: async (comicId, epId) => {
            let path =  epId.split('?')[1]
            let res = await Network.get(
                'https://www.antbyw.com/plugin.php?' + path,
                {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }
            )
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            // const urlRegex = /url:\s*"([^"]+)"/g;
            // const matches = [...res.body.matchAll(urlRegex)];
            // const images = matches.map((match) => match[1]);
            let images = []
            const arrayMatch = res.body.match(/let urls\s*=\s*(\[[\s\S]*?\]);/);
            if (arrayMatch) {
                const arrayString = arrayMatch[1];
                // 安全解析数组（包含中文字符）
                images = Function(`return ${arrayString}`)();
            }

            // 正则匹配 imglist 数组
            // const imglistRegex = /urls\s*=\s*(\[[^\]]*?\])/;
            // const imglistMatch = res.body.match(imglistRegex);

            // let images = []
            // if (imglistMatch) {
            //     // 提取 imglist 数组部分
            //     const imglistStr = imglistMatch[1];
            //     // 进一步提取所有 URL
            //     const urlRegex = /https?:\/\/[^\s"']+/g;
            //     const urls = imglistStr.match(urlRegex);
            //     images = urls;
            //     console.log(urls);
            // } else {
            //     console.log("未找到 imglist 数据");
            // }
            // let document = new HtmlDocument(res.body)
            // console.log(eval('window.imgscroll.options.img_list'));
            return {
                images: images
            }
        },
        onClickTag: (namespace, tag) => {
            if(namespace == "作者"){
                return {
                    // 'search' or 'category'
                    action: 'search',
                    keyword: `${namespace}:${tag}`,
                    // {string?} only for category action
                    param: null,
                }
            }
            throw "未支持此类Tag检索"
        },
        onImageLoad: (url, comicId, epId) => {
            return {
                url: url,
                headers: {
                    "Referer": 'https://www.antbyw.com/',
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }
            }
        },
        onThumbnailLoad: (url) => {
            return {
                url: url,
                headers: {
                    "Referer": 'https://www.antbyw.com/',
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                }
            }
        },
        /// 警告: 这是历史遗留问题, 对于新的漫画源, 不应当使用此字段, 在选取漫画id时, 不应当出现特殊字符
        matchBriefIdRegex: "https://ymcdnyfqdapp.ikmmh.com/book/(\\d+)/"
    }
}
