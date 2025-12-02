/** @type {import('./_venera_.js')} */
class ColaManga extends ComicSource {
    // Note: The fields which are marked as [Optional] should be removed if not used

    // name of the source
    name = "可乐漫画"

    // unique id of the source
    key = "cola_manga"

    version = "1.0.0"

    minAppVersion = "1.4.0"

    // update url
    url = "https://github.com/lingxidev/venconfigs/blob/main/cola_manga.js"

    // 漫画信息
    baseUrl = "https://www.colamanga.com/"

    /// 解析漫画列表
    parseComic(e) {
        let url = e.querySelector("a.fed-list-pics").attributes['href']
        let id = url.replaceAll("/", '')
        let title = e.querySelector("a.fed-list-title").text.trim()
        let cover = e.querySelector("a.fed-list-pics").attributes['data-original']
        let tags = null
        let description = e.querySelector("span.fed-list-remarks").text.trim()
        return {
            id: id,
            title: title,
            cover: cover,
            tags: tags,
            description: description
        }
    }

    // 解析查询结果
    parseSearch(dl) {
        let url = dl.querySelector("a.fed-list-pics").attributes['href']
        let id = url.replaceAll("/", '')
        let title = dl.querySelector("h1 > a").text.trim()
        let cover = dl.querySelector("a.fed-list-pics").attributes['data-original']
        let tags = dl.querySelectorAll("ul > li:first-child > a").map(e => e.text.trim())
        let description = dl.querySelectorAll("ul > li.fed-part-eone")[1].text.replace('最新', '').trim()

        return {
            id: id,
            title: title,
            cover: cover,
            tags: tags,
            description: description
        }
    }
    async getHtml(url) {
        let headers = { "Referer": this.baseUrl, "Cookie": "_va=13" }
        let res = await Network.get(url, headers)
        if (res.status !== 200) {
            throw "Invalid status code: " + res.status
        }
        let document = new HtmlDocument(res.body)
        return document
    }

    // 探索页面列表
    explore = [
        {
            // 页面标题。
            // 标题用于标识页面，应该是唯一的
            title: "可乐漫画",

            /// 多部分页面、多页漫画列表或混合类型
            type: "singlePageWithMultiPart",

            /**
             * 加载函数
             * @param page {number | null} - 页码，对于 `singlePageWithMultiPart` 类型为 null
             * @returns {{}}
             * - 对于 `multiPartPage` 类型，返回 [{title: string, comics: Comic[], viewMore: PageJumpTarget}]
             * - 对于 `multiPageComicList` 类型，对于每个页码（从 1 开始），返回 {comics: Comic[], maxPage: number}
             * - 对于 `mixed` 类型，使用参数 `page` 作为索引。对于每个索引（从 0 开始），返回 {data: [], maxPage: number?}，data 是一个包含 Comic[] 或 {title: string, comics: Comic[], viewMore: string?} 的数组
             */
            load: async (page) => {
                let document = await this.getHtml(this.baseUrl)
                let parts = document.querySelectorAll("div.fed-list-home")
                let result = {}
                for (let part of parts) {
                    let title = part.querySelector("h2.fed-font-xvi").text.trim()
                    let comics = part.querySelectorAll("li.fed-list-item").map(e => this.parseComic(e))
                    if (comics.length > 0) {
                        result[title] = comics
                    }
                }
                return result
            },

            /**
             * 仅用于 `multiPageComicList` 类型。
             * 如果 `load` 函数已实现，则 `loadNext` 将被忽略。
             * @param next {string | null} - 下一页令牌，第一页时为 null
             * @returns {Promise<{comics: Comic[], next: string?}>} - 如果没有下一页，next 为 null。
             */
            loadNext(next) { },
        }
    ]

    // categories
    category = {
        /// 分类页面的标题，用于标识页面，应该是唯一的
        title: "可乐漫画",
        parts: [
            {
                // 部分的标题
                name: "类型",

                // 固定、随机或动态
                // 如果是随机类型，需要提供 `randomNumber` 字段，该字段表示同时显示的漫画数量
                // 如果是动态类型，需要提供 `loader` 字段，该字段表示加载漫画的函数
                type: "fixed",

                // 如果类型是动态的，则移除该字段
                categories: ["热血", "玄幻", "恋爱", "冒险", "古风", "都市", "穿越", "奇幻", "其他", "搞笑", "少男", "战斗", "重生", "冒险热血", "逆袭", "少年", "爆笑", "系统", "后宫", "少女", "熱血", "动作", "冒險", "校园", "修真", "剧情", "修仙", "大女主", "霸总", "少年热血"],
                itemType: "category",
                categoryParams: ['', '10023', '10024', '10126', '10210', '10143', '10124', '10129', '10242', '10560', '10122', '10641', '10309', '10461', '11224', '10943', '10321', '10201', '10722', '10138', '10301', '12044', '10125', '12123', '10131', '10133', '10480', '10453', '10706', '10127', '12163']
            }
        ],
        // 启用排行榜页面
        enableRankingPage: false,
    }

    /// category comic loading related
    categoryComics = {
        /**
         * load comics of a category
         * @param category {string} - category name
         * @param param {string?} - category param
         * @param options {string[]} - options from optionList
         * @param page {number} - page number
         * @returns {Promise<{comics: Comic[], maxPage: number}>}
         */
        load: async (category, param, options, page) => {
            let document = await this.getHtml(`${this.baseUrl}/show?status=${options[0]}&orderBy=weeklyCount&mainCategoryId=${param}&page=${page}`)
            let maxPage = null
            // #fed-count
            let count = document.querySelector("#fed-count")
            if (count) {
                maxPage = count.text
            }
            let comics = document.querySelectorAll("li.fed-list-item").map(e => this.parseComic(e))
            return {
                comics: comics,
                maxPage: maxPage
            }
        },
        optionList: [
            {
                options: ["-全部", "1-连载中", "2-已完结"],
            }
        ],
        // ranking: {
        //     // For a single option, use `-` to separate the value and text, left for value, right for text
        //     options: ["update-更新日", "create-收录日", "dailyCount-日点击", "weeklyCount-周点击", "monthlyCount-月点击"],
        //     /**
        //      * load ranking comics
        //      * @param option {string} - option from optionList
        //      * @param page {number} - page number
        //      * @returns {Promise<{comics: Comic[], maxPage: number}>}
        //      */
        //     load: async (option, page) => {
        //         let params = {
        //             mainCategoryId: param,
        //             orderBy: option,
        //             status: ""
        //         }
        //         let document = await this.getHtml(`${this.baseUrl}/show?${new URLSearchParams(params)}`)
        //         let maxPage = null
        //         // #fed-count
        //         let count = document.querySelector("#fed-count")
        //         if (count) {
        //             maxPage = count.text
        //         }
        //         let comics = document.querySelectorAll("li.fed-list-item").map(e => this.parseComic(e))
        //         return {
        //             comics: comics,
        //             maxPage: maxPage
        //         }
        //     }
        // }
    }

    /// search related
    search = {
        /**
         * load search result
         * @param keyword {string}
         * @param options {string[]} - options from optionList
         * @param page {number}
         * @returns {Promise<{comics: Comic[], maxPage: number}>}
         */
        load: async (keyword, options, page) => {
            let res = await Network.get(`${this.baseUrl}/search?type=1&searchString=${keyword}`)
            if (res.status !== 200) {
                throw "Invalid status code: " + res.status
            }
            let comics = document.querySelectorAll("dl.fed-deta-info").map(e => this.parseComic(e))
            // 找到 a.fed-btns-info 中 text 为 尾页 的元素
            // <a class="fed-btns-info fed-rims-info fed-hide fed-show-xs-inline" href="javascript:;" onclick="__js.show('266')">尾页</a>
            let maxPage = null
            let jump = document.querySelector("a.show-page-jump")
            if (jump) {
                maxPage = jump.attributes['data-total']
            }

            return {
                comics: comics,
                maxPage: maxPage
            }
        },

        // provide options for search
        optionList: [
        ],
    }

    /// single comic related
    comic = {
        /**
         * load comic info
         * @param id {string}
         * @returns {Promise<ComicDetails>}
         */
        loadInfo: async (id) => {
            // 获取漫画基本信息
            let document = await this.getHtml(`${this.baseUrl}/${id}/`)
            let dl = document.querySelector("dl")
            let title = dl.querySelector("h1.fed-part-eone").text.trim()
            let cover = dl.querySelector("a.fed-list-pics").attributes['data-original']
            let ul = dl.querySelectorAll("ul > li.fed-part-eone")
            let author = ul[1].text.replace('作者', '').trim()
            let tags = ul[4].querySelectorAll("a").map(e => e.text.trim())
            let updateTime = ul[2].text.replace('更新', '').trim()
            let description = dl.querySelector('div.fed-part-esan').text.trim()
            // 获取章节名
            let chapters = new Map()
            let dataList = document.querySelector('div.all_data_list').querySelectorAll('li')
            let i = 0
            for (let c of dataList) {
                chapters.set(i.toString(), c.text.trim())
                i++
            }
            // 获取推荐漫画
            let recommend = []
            for (let c of document.querySelectorAll("li.fed-list-item")) {
                let url = c.querySelector("a.fed-list-pics").attributes['href']
                let id = url.replaceAll("/", '')
                let title = c.querySelector("a.fed-list-title").text.trim()
                let cover = c.querySelector("a.fed-list-pics").attributes['data-original']
                recommend.push({
                    id: id,
                    title: title,
                    cover: cover
                })
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


        /**
         * load images of a chapter
         * @param comicId {string}
         * @param epId {string?}
         * @returns {Promise<{images: string[]}>}
         */
        loadEp: async (comicId, epId) => {
            /*
            ```
            return {
                // string[]
                images: images
            }
            ```
            */
            const images = [];
            let currentPageUrl = `${this.baseUrl}/${comicId}/1/${epId}.html`;
            // const res = await Network.get(currentPageUrl);
            let res = await InAppOpen.load(
                currentPageUrl,
                {
                "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
                },
                `!function () {
                    __cr.init();
                    __cad.setCookieValue();
                    const pageCountKey = __cad.getCookieValue()[1] + mh_info.pageid.toString();
                    const pageCount = parseInt($.cookie(pageCountKey) || "0");
                    const images = [...Array(pageCount).keys()].map((i) => __cr.getPicUrl(i + 1));
                    __cr.isfromMangaRead = 1;
                    console.log(images);
                    console.log(__js.getDataParse());
                    console.log(CryptoJS.enc.Utf8.stringify();
                    const key = CryptoJS.enc.Utf8.stringify(__js.getDataParse());
                    console.log(key);
                    return { images, key, keyType: window.image_info.keyType || "0"};
                }()`
            );
            if (res.status !== 200) throw "Invalid status code: " + res.status;
            console.log(JSON.parse(res.body));
            // 解析当前页图片
            // const doc = new HtmlDocument(res.body);
            // doc.querySelectorAll("#mangalist > div.mh_comicpic > img").forEach(img => {
            //     const src = img?.attributes?.['src'];
            //     if (typeof src === 'string') images.push(src);
            // });
            return {
                images: []
            }
        },
        /**
         * [Optional] provide configs for an image loading
         * @param url
         * @param comicId
         * @param epId
         * @returns {ImageLoadingConfig | Promise<ImageLoadingConfig>}
         */
        onImageLoad: async (url, comicId, epId) => {
            return {
                headers: {
                    'Referer': `https://www.colamanga.com/${comicId}${epId}`,
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                    // 'Accept': '*/*',
                    // 'Host': 'res.colamanga.com',
                    // 'Connection': 'keep-alive',
                    // 'Cookie': '_va=13',
                    'origin': 'https://www.colamanga.com'
                },
                modifyImage: `
                   function stringToArrayBuffer(str) {
                        const length = str.length;
                        const arrayBuffer = new ArrayBuffer(length);
                        const view = new Uint8Array(arrayBuffer);
                        for (let i = 0; i < length; i++) {
                            view[i] = str.charCodeAt(i); 
                        }
                        return arrayBuffer;
                    }
                    let modifyImage = (image) => {
                        const iv = new Uint8Array(16); // 假设 IV 是全零
                        const key = stringToArrayBuffer('sxxxxx');
                        return Convert.decryptAesCbc(image,key, iv)
                    }
                `,
            }
        },
         /**
         * [Optional] provide configs for a thumbnail loading
         * @param url {string}
         * @returns {{}}
         */
        onThumbnailLoad: (url) => {
           return {
                headers: {
                    'Referer': 'https://www.colamanga.com',
                    'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
                    'Accept': '*/*',
                    'Host': 'res.colamanga.com',
                    'Connection': 'keep-alive',
                    'Cookie': '_va=13',
                }
            }
        },

    }


}