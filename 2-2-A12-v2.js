const movieGenreId = [1, 2, 3, 4, 5, 7, 9, 11, 14, 15]
const originGenres = {
  "1": "動作類",
  "2": "冒險類",
  "3": "動畫類",
  "4": "喜劇類",
  "5": "犯罪類",
  "6": "紀錄片類",
  "7": "劇情類",
  "8": "Family",
  "9": "奇幻類",
  "10": "History",
  "11": "恐怖類",
  "12": "Music",
  "13": "Mystery",
  "14": "愛情文藝類",
  "15": "科幻類",
  "16": "TV Movie",
  "17": "Thriller",
  "18": "War",
  "19": "Western"
}

const moviesPerGenre = 8 //定義首頁每個類別顯示數量
const moviesPerPage = 12 //定義非首頁顯示模式時 每個頁面顯示數量
const baseURL = "https://movie-list.alphacamp.io/api/v1/movies"
const generalMovies = JSON.parse(localStorage.getItem('generalData')) || []
const favoriteMovies = []
let searchResult = []
let searchValue = ''
let pageNum = 1
let displaySwitch = 'card-type'

const body = document.querySelector('body')
const container = document.querySelector('.container')
const genres = document.querySelector('.genres')
const movieGenres = document.querySelector('.movieGenres')
const pagination = document.querySelector('.pagination')
const searchBox = document.querySelector('.search')

const view = {
  // 顯示類別選項
  renderGenreSelection() {
    movieGenreId.forEach((item) => {
      genres.innerHTML += `
        <input class="ms-2" type="radio" name="genreFilter" value="${item}" />${originGenres[item]}
      `
    })
  },

  // 按類別顯示所有電影
  renderHomePageMovies(genre, index) {
    let innerMoviesHtml = this.renderSingleGenreMovie(genre, index)
    movieGenres.innerHTML += `
    <div class="movieList">
      <h5 class="genreTitle">${genre}</h5>
      <div class="genre">
        <i class="fas fa-chevron-left left" data-direction="left" data-genre="${genre}" data-move="0" id="left${genre}"></i>
        <div class="genreMovies ${genre}">
          ${innerMoviesHtml}
        </div>
        <i class="fas fa-chevron-right right" data-direction="right" data-genre="${genre}" data-move="0" id="right${genre}"></i>
      </div>
    </div>
    `
  },

  // 顯示個別類別電影
  renderSingleGenreMovie(genre, index) {
    let listByGenre = JSON.parse(localStorage.getItem(`${genre}`)) || []
    let renderData = listByGenre.slice(index, index + moviesPerGenre)
    let movieHtmlCode = ''
    renderData.forEach(item => {
      movieHtmlCode += `
        <div class="movie">
          <div class="moviePost">
            <img src="https://movie-list.alphacamp.io/posters/${generalMovies[item - 1].image}" alt="${generalMovies[item - 1].title}">
          </div>
          <p class="movieTitle">${generalMovies[item - 1].title}</p>
          <p class="movieDescription">${generalMovies[item - 1].description}</p>
          <div class="movieButton">
            <button class="movieModalBtn" data-id="${item}">Details</button>
            <button class="movieCollectBtn" data-id="${item}">Collect</button>
          </div>
        </div>
      `
    })
    return movieHtmlCode
  },

  // 顯示Modal
  renderModal(data) {
    const modal = document.createElement("div")
    modal.classList = 'modalContainer'
    let casts = data.cast
    let castsHtml = casts.reduce((accu, item) => {
      return accu + `<span class="cast">Character : ${item.character} --> Actor : ${item.name}</span>`
    }, '')
    modal.innerHTML = `
      <div class="modalBox">
        <div class="img">
          <img src="https://movie-list.alphacamp.io/posters/${data.image}" alt="${data.title}">
        </div>
        <div class="movieDetails">
          <h4 class="movieTitleModal">${data.title}</h4>
          <span class="publishTime">發行年份 : ${data.release_date}</span>
          <span class="director">導演 : ${data.director}</span>
          <div class="allCasts">
            <span class="cast">演員 : </span>
            ${castsHtml}
          </div>
          <p class="descriptionModal">故事大綱 : ${data.description}</p>
          <button class="close">Close</button>
        </div>
      </div>
    `
    body.insertBefore(modal, container)
  },

  // 關閉Modal
  closeModal() {
    let modal = document.querySelector('.modalContainer')
    modal.remove()
  },

  // 顯示收藏頁或搜尋頁
  renderMoviesGeneralMode(pageNum, displaySwitch, data) {
    movieGenres.innerHTML = ''
    if (!data || !data[0]) {
      movieGenres.innerHTML = '<div class="noResult">抱歉, 我們找不到你想找的電影</div>'
    } else {
      let renderData = data.slice((pageNum - 1) * moviesPerPage, (pageNum - 1) * moviesPerPage + moviesPerPage)
      let innerMoviesHtml = renderData.reduce((accu, item) => {
        return accu += this.renderByDisplayType(item, displaySwitch)
      }, '')
      movieGenres.innerHTML = `
        <div class="general ${displaySwitch}">
          ${innerMoviesHtml}
        </div>
      `
    }
  },

  // 顯示單個
  renderByDisplayType(item, displaySwitch) {
    let id = item.id
    let btn = ''
    if (controller.favoriteDisplay === 'on') {
      btn = `<button class="removeCollectBtn ${displaySwitch}" data-id="${id}">Remove</button>`
    } else {
      btn = `<button class="movieCollectBtn ${displaySwitch}" data-id="${id}">Collect</button>`
    }
    let movieHtmlCode = `
      <div class="single ${displaySwitch}" id="m${id}">
        <div class="moviePost ${displaySwitch}">
          <img src="https://movie-list.alphacamp.io/posters/${item.image}" alt="${item.title}">
        </div>
        <h5 class="movieTitle">${item.title}</h5>
        <p class="movieDescription">${item.description}</p>
        <div class="movieButton">
          <button class="movieModalBtn ${displaySwitch}" data-id="${id}">Details</button>
          ${btn}
        </div>
      </div>
    `
    return movieHtmlCode
  },

  // 由收藏頁中移除
  removeFromFavorite(target) {
    let removal = document.querySelector(`#${'m' + target.dataset.id}`)
    removal.remove()
    Math.ceil(favoriteMovies.length / moviesPerPage) >= pageNum ? pageNum : pageNum = pageNum - 1
  },

  //顯示分頁碼
  paginationRender(data, targetBlock) {
    let itemQty = 0
    !data ? itemQty : itemQty = data.length
    let numberOfPages = Math.ceil(itemQty / moviesPerPage)
    targetBlock.innerHTML = ''
    for (let i = 1; i <= numberOfPages; i++) {
      targetBlock.innerHTML += `
    <li class="page page-item"><a class="page page-link" href="#" data-page="${i}" page="p${i}">${i}</a></li>
    `
    }
  }
}

const model = {
  // 獲取所有電影基本資料
  getGeneralData(baseURL) {
    axios.get(baseURL).then((response) => {
      let generalData = []
      generalData.push(...response.data.results)
      localStorage.setItem('generalData', JSON.stringify(generalData))
      movieGenreId.forEach(item => this.generateGenreData(item))
    })
      .catch(function (error) {
        console.log(error)
      })
  },

  // 建立類別資料
  generateGenreData(singleGenreId) {
    let singleGenreData = []
    generalMovies.forEach(item => {
      if (item.genres.includes(singleGenreId)) {
        singleGenreData.push(item.id)
      }
    })
    localStorage.setItem(`${originGenres[singleGenreId]}`, JSON.stringify(singleGenreData))
  },

  // 獲取指定電影詳細資料
  getSingleMovieData(id) {
    let targetUrl = baseURL + "/" + id
    axios.get(targetUrl).then(response => {
      view.renderModal(response.data.results)
      document.querySelector('.modalContainer').addEventListener('click', event => {
        if (event.target.classList.contains('close')) {
          view.closeModal()
        }
      })
    })
      .catch(function (error) {
        console.log(error)
      })
  },

  // 獲取搜尋資料 回傳陣列
  getSearchData(searchValue, sourceData) {
    return sourceData.filter(item => item.title.toLowerCase().includes(searchValue) ? item : false)
  },

  // 獲取篩選資料 回傳陣列
  getFilterData([time, genre], sourceData) {
    if (time && genre) {
      if (time === 2010) {
        return sourceData.filter(item => item.genres.includes(genre) && Number(item.release_date.slice(0, 4)) >= 2010)
      } else {
        return sourceData.filter(item => item.genres.includes(genre) && Number(item.release_date.slice(0, 4)) >= time && Number(item.release_date.slice(0, 4)) <= (time + 9))
      }
    } else if (!time && !genre) {
      return generalMovies
    } else if (genre) {
      return sourceData.filter(item => item.genres.includes(genre))
    } else if (time) {
      if (time === 2010) {
        return sourceData.filter(item => Number(item.release_date.slice(0, 4)) >= 2010)
      } else {
        return sourceData.filter(item => Number(item.release_date.slice(0, 4)) >= time && Number(item.release_date.slice(0, 4)) <= (time + 9))
      }
    }
  },

  // 獲取篩選條件值
  getFilterValue() {
    let genresRadio = document.querySelectorAll('input[name=genreFilter]')
    let timeRadio = document.querySelectorAll('input[name=timefilter]')
    let timeValue = ''
    let genreValue = ''
    for (let i = 0; i < timeRadio.length; i++) {
      if (timeRadio[i].checked) {
        timeValue = timeRadio[i].value
      }
    }

    for (let i = 0; i < genresRadio.length; i++) {
      if (genresRadio[i].checked) {
        genreValue = genresRadio[i].value
      }
    }
    return [Number(timeValue), Number(genreValue)]
  },

  clearCheckedValue() {
    let genresRadio = document.querySelectorAll('input[name=genreFilter]')
    let timeRadio = document.querySelectorAll('input[name=timefilter]')
    for (let i = 0; i < timeRadio.length; i++) {
      if (timeRadio[i].checked) {
        timeRadio[i].checked = false
      }
    }

    for (let i = 0; i < genresRadio.length; i++) {
      if (genresRadio[i].checked) {
        genresRadio[i].checked = false
      }
    }
  },

  getGenreSlideIndex(target) {
    let genre = target.dataset.genre
    const leftArrow = document.querySelector(`#left${genre}`)
    const rightArrow = document.querySelector(`#right${genre}`)
    let moveReference = Number(target.dataset.move) //為了計算分類電影移動使用 此參數代表最左邊電影在資料中的index
    let targetData = JSON.parse(localStorage.getItem(`${genre}`)) || []
    let startIndex = 0
    if (target.dataset.direction === 'right') {
      startIndex = moveReference + moviesPerGenre
      if (startIndex > (targetData.length - 1)) {
        startIndex = moveReference
        leftArrow.style.visibility = 'visible'
        rightArrow.style.visibility = 'hidden'
      } else if ((startIndex + moviesPerGenre) >= (targetData.length - 1)) {
        startIndex = startIndex - ((startIndex + moviesPerGenre) - (targetData.length - 1))
        target.dataset.move = startIndex
        leftArrow.dataset.move = startIndex
        leftArrow.style.visibility = 'visible'
        rightArrow.style.visibility = 'hidden'
      } else {
        target.dataset.move = startIndex
        leftArrow.dataset.move = startIndex
        leftArrow.style.visibility = 'visible'
        rightArrow.style.visibility = 'visible'
      }
    } else if (target.dataset.direction === 'left') {
      if ((moveReference - moviesPerGenre) <= 0) {
        startIndex = 0
        target.dataset.move = 0
        rightArrow.dataset.move = 0
        leftArrow.style.visibility = 'hidden'
        rightArrow.style.visibility = 'visible'
      } else {
        startIndex = moveReference - moviesPerGenre
        target.dataset.move = startIndex
        rightArrow.dataset.move = startIndex
        leftArrow.style.visibility = 'visible'
        rightArrow.style.visibility = 'visible'
      }
    }
    return [genre, startIndex]
  },

  addToFavorite(target) {
    let data = generalMovies.filter(item => item.id === Number(target.dataset.id))
    let checkValue = favoriteMovies.filter(item => item.id === data[0].id)
    if (!checkValue[0]) {
      favoriteMovies.push(data[0])
    }
  },

  removeFavoriteItem(target) {
    let targetIndex = favoriteMovies.findIndex(item => item.id === Number(target.dataset.id))
    favoriteMovies.splice(targetIndex, 1)
  }
}

const controller = {
  originalDisplay: 'on',
  favoriteDisplay: 'off',
  search: 'off',
  filter: 'off',

  renderControl(event) {
    let target = event.target
    if (event.type === 'keyup') {
      model.clearCheckedValue()
      this.originalDisplay = 'off'
      this.search = 'on'
      this.filter = 'off'
      searchValue = event.target.value.trim().toLowerCase()
      let sourceData = this.favoriteDisplay === 'on' ? favoriteMovies : generalMovies
      searchResult = model.getSearchData(searchValue, sourceData)
      pageNum = 1
    } else if (event.type === 'click') {
      if (target.classList.contains('homePage')) {
        model.clearCheckedValue()
        this.originalDisplay = 'on'
        this.favoriteDisplay = 'off'
        this.search = 'off'
        this.filter = 'off'
        searchBox.value = ''
      } else if (target.classList.contains('favorite')) {
        model.clearCheckedValue()
        this.originalDisplay = 'off'
        this.favoriteDisplay = 'on'
        this.search = 'off'
        this.filter = 'off'
        searchBox.value = ''
        pageNum = 1
      } else if (target.classList.contains('filter')) {
        this.originalDisplay = 'off'
        this.filter = 'on'
        this.search = 'off'
        searchBox.value = ''
        pageNum = 1
      } else if (target.classList.contains('movieModalBtn')) {
        model.getSingleMovieData(Number(target.dataset.id))
        return
      } else if (target.classList.contains('removeCollectBtn')) {
        model.removeFavoriteItem(target)
        view.removeFromFavorite(target)
      } else if (target.classList.contains('movieCollectBtn')) {
        model.addToFavorite(target)
      } else if (target.classList.contains('card-type')) {
        this.originalDisplay = 'off'
        displaySwitch = 'card-type'
      } else if (target.classList.contains('list-type')) {
        this.originalDisplay = 'off'
        displaySwitch = 'list-type'
      } else if (target.classList.contains('page')) {
        pageNum = Number(target.dataset.page)
      } else {
        return
      }
    }

    switch (this.originalDisplay) {
      case 'on': //原始首頁狀態
        movieGenres.innerHTML = ''
        pagination.innerHTML = ''
        movieGenreId.forEach(item => view.renderHomePageMovies(originGenres[item], 0))
        break
      case 'off':
        switch (this.favoriteDisplay) {
          case 'on': //收藏頁狀態
            if (this.search === 'off' && this.filter === 'off') {
              view.renderMoviesGeneralMode(pageNum, displaySwitch, favoriteMovies)
              view.paginationRender(favoriteMovies, pagination)
            } else if (this.search === 'on' && this.filter === 'off') {
              view.renderMoviesGeneralMode(pageNum, displaySwitch, searchResult)
              view.paginationRender(searchResult, pagination)
            } else if (this.search === 'off' && this.filter === 'on') {
              let filterResult = model.getFilterData(model.getFilterValue(), favoriteMovies)
              view.renderMoviesGeneralMode(pageNum, displaySwitch, filterResult)
              view.paginationRender(filterResult, pagination)
            }
            break

          case 'off': //非收藏頁狀態
            if (this.search === 'off' && this.filter === 'off') {
              view.renderMoviesGeneralMode(pageNum, displaySwitch, generalMovies)
              view.paginationRender(generalMovies, pagination)
            } else if (this.search === 'on' && this.filter === 'off') {
              view.renderMoviesGeneralMode(pageNum, displaySwitch, searchResult)
              view.paginationRender(searchResult, pagination)
            } else if (this.search === 'off' && this.filter === 'on') {
              let filterResult = model.getFilterData(model.getFilterValue(), generalMovies)
              view.renderMoviesGeneralMode(pageNum, displaySwitch, filterResult)
              view.paginationRender(filterResult, pagination)
            }
            break
        }
    }
  }
}

model.getGeneralData(baseURL)
view.renderGenreSelection()
movieGenreId.forEach(item => view.renderHomePageMovies(originGenres[item], 0))
movieGenres.addEventListener('click', event => {
  let target = event.target
  if (target.classList.contains('left') || target.classList.contains('right')) {
    const genreMovies = document.querySelector(`.genreMovies.${target.dataset.genre}`)
    genreMovies.innerHTML = view.renderSingleGenreMovie(...model.getGenreSlideIndex(target))
  }
})
container.addEventListener('keyup', event => {
  controller.renderControl(event)
  if (document.querySelector(`a[page=p${pageNum}]`)) {
    let targetPage = document.querySelector(`a[page=p${pageNum}]`)
    targetPage.style.backgroundColor = "coral"
  }
})
container.addEventListener('click', event => {
  controller.renderControl(event)
  if (document.querySelector(`a[page=p${pageNum}]`)) {
    let targetPage = document.querySelector(`a[page=p${pageNum}]`)
    targetPage.style.backgroundColor = "coral"
  }
})