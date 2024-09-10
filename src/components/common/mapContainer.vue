<!-- @FileDescription: 公共-高德地图组件 -->
<template>
  <div id="all">
    <div class="posInput">
      <el-input
        style="width: 350px"
        id="tipinput"
        placeholder="请输入搜索地址"
        v-model="address"
        @change="searchKeyWord"
      >
        <el-button type="primary" slot="append" icon="el-icon-search" @click="searchKeyWord"></el-button>
      </el-input>
      <!-- <el-input style="width: 100px;" id="tipinput" v-model="effective_range" @change="distanceFn()">
        <i slot="suffix" style="font-style: normal; margin-right: 10px;">米</i></el-input
      > -->
      <div class="map_search_result" v-if="show">
        <ul>
          <li v-for="(item, index) in poiList" :key="index" @click="markerResult(item)">{{ item.name }}</li>
        </ul>
      </div>
    </div>
    <div id="allmap"></div>
  </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
window._AMapSecurityConfig = {
  securityJsCode: '60dcc64efdca6fb9bed8aeacbe21d2b8'
}

var map = {}
export default {
  name: 'CrmebOaEntIndex',
  props: {
    positionInfo: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      address: '',
      marker: null,
      placeSearchComponent: null,
      show: false,
      poiList: [],
      effective_range: 1000,
      radius: 200 // 控制标记点范围大小
    }
  },

  mounted() {
    this.initMap()

    this.address = this.positionInfo.address
  },
  watch: {
    positionInfo: {
      handler(nVal, oVal) {
        this.effective_range = nVal.effective_range
        this.address = nVal.address
      },
      deep: true
    }
  },

  methods: {
    initMap() {
      const that = this
      return new Promise((reslove, reject) => {
        AMapLoader.load({
          key: 'cf5c437b14780406af75a81b380cafac',
          version: '2.0',
          plugins: [
            'AMap.ToolBar',
            'AMap.Scale',
            'AMap.Geocoder',
            'AMap.Geolocation',
            'AMap.PlaceSearch',
            'AMap.AutoComplete',
            'AMap.CitySearch'
          ],
          resizeEnable: true
        }).then((AMap) => {
          that.map = new AMap.Map('allmap', {
            resizeEnable: true,
            zoom: 14,
            viewMode: '3D', //使用3D视图
            center: [that.positionInfo.lng, that.positionInfo.lat]
          })
          that.getCurrentLocation()
          that.map.addControl(new AMap.Scale()) // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
          that.map.addControl(new AMap.ToolBar()) //在图面添加鹰眼控件，在地图右下角显示地图的缩略图
          that.geocoder = new AMap.Geocoder({ radius: 1000, extensions: 'all', city: '全国' })
          that.mapSearchInit()
          that.geocoder.getAddress([that.positionInfo.lng, that.positionInfo.lat], function (status, result) {
            if (status === 'complete' && result.regeocode) {
              that.address = result.regeocode.formattedAddress
            } else {
              that.$message.error('根据经纬度查询地址失败')
            }
          })
        })
      })
    },
    distanceFn() {
      let thisPosition = {
        address: this.address,
        lng: this.positionInfo.lng,
        lat: this.positionInfo.lat,
        effective_range: this.effective_range
      }

      this.$emit('select', thisPosition) //返回给父组件
    },

    // 初始化地图
    getCurrentLocation() {
      const that = this
      that.geolocation = new AMap.Geolocation({
        timeout: 1000, //超过3秒后停止定位，默认：5s
        enableHighAccuracy: true,
        zoomToAccuracy: true //定位成功后是否自动调整地图视野到定位点
      })
      that.geolocation.getCurrentPosition(function (status, result) {
        if (status == 'complete') {
          that.onComplete(result)
        } else {
          that.onError(result)
        }
      })
    },

    // 动态设置点标记
    dynamicSign(lng, lat, radius) {
      var marker = new AMap.Marker({
        position: new AMap.LngLat(lng, lat), //参数为经纬度
        draggable: true,
        cursor: 'move',
        riseOnHover: true,
        bubble: true,
        cursor: 'pointer'
      })
      // 构造矢量圆形
      const circle = new AMap.Circle({
        center: new AMap.LngLat(lng, lat), // 圆心位置
        radius: radius, //半径
        strokeColor: '#1890ff', //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 1, //线粗细度
        fillColor: '#1890ff', //填充颜色
        fillOpacity: 0.35 //填充透明度
      })
      this.map.clearMap()
      this.map.add([marker, circle]) // 添加点标志
      marker.on('dragend', this.markerClick)
    },

    //设置点标记
    onComplete(data) {
      let lnglat = data.position
      this.dynamicSign(lnglat[0], lnglat[1], 200)
    },

    onError(data) {
      this.getLngLatLocation()
    },

    //在获取具体定位失败时调用的代码：（非精准定位！！！）
    getLngLatLocation() {
      const that = this
      that.geolocation.getCityInfo(function (status, result) {
        if (status === 'complete') {
          let data = result.position

          that.showLocation(data)
        } else {
          that.$message.error('获取地址失败')
        }
      })
    },

    showLocation(data) {
      this.dynamicSign(this.positionInfo.lng, this.positionInfo.lat, this.radius)
    },

    // 标记点拖拽完成回调函数
    markerClick(e) {
      let lng = e.lnglat.lng
      let lat = e.lnglat.lat
      this.dynamicSign(lng, lat, this.radius)
      let lnglat = [lng, lat]
      let that = this
      that.geocoder.getAddress(lnglat, function (status, result) {
        if (status === 'complete' && result.regeocode) {
          that.address = result.regeocode.formattedAddress
          let thisPosition = {
            address: that.address,
            lng: lng,
            lat: lat,
            effective_range: that.effective_range
          }
          that.positionInfo.lng = lng
          that.positionInfo.lat = lat
          that.$emit('select', thisPosition) //返回给父组件
        } else {
          that.$message.error('根据经纬度查询地址失败')
        }
      })
    },
    mapSearchInit() {
      this.placeSearchComponent = new AMap.PlaceSearch()
    },
    searchKeyWord() {
      let that = this
      that.placeSearchComponent.search(that.address, function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
          that.show = true
          that.poiList = result.poiList.pois
        } else {
          that.showsearchResult = false
          that.poiList = []
          that.$message({
            message: '没有查到结果',
            type: 'warning'
          })
        }
      })
    },
    markerResult(data) {
      this.show = false
      this.address = data.name
      var marker = new AMap.Marker({
        position: [Number(data.location.lng), Number(data.location.lat)],
        draggable: true,
        cursor: 'move',
        riseOnHover: true
      })

      this.map.clearMap() // 清除所有覆盖物（点标志）
      this.map.add(marker) // 添加点标志

      setTimeout(() => {
        this.map.setCenter(data.location)
        // this.map.setZoom(15)
        this.dynamicSign(data.location.lng, data.location.lat, 200)
      }, 50)
      let thisPosition = {
        address: this.address,
        lng: data.location.lng,
        lat: data.location.lat,
        effective_range: this.effective_range
      }
      this.positionInfo.lng = data.location.lng
      this.positionInfo.lat = data.location.lat
      this.$emit('select', thisPosition)
      marker.on('dragend', this.markerClick)
    }
  }
}
</script>

<style lang="scss" scoped>
#all {
  height: 100%;
  position: relative;
}
#allmap {
  width: 100%;
  height: 100%;
  font-family: '微软雅黑';
}
.posInput {
  position: absolute;
  z-index: 1;
  width: 80%;
  margin-top: 20px;
  margin-left: 10%;
}
.posSubmit {
  position: absolute;
  z-index: 1;
  bottom: 0;
  margin-left: 5%;
  width: 90%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.btn_box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
::v-deep .el-form-item {
  margin-bottom: 0 !important;
}
/deep/.el-input__suffix {
  position: absolute;
  top: 10px;
}
/deep/ .el-input-group__append button.el-button {
  background-color: #1890ff;
  color: #fff;
  border-radius: 0 4px 4px 0;
}
/deep/.el-input-group__append {
  top: 0;
}
.map_search_result {
  cursor: pointer;
  height: 300px;
  width: 400px;
  background-color: #f5f5f5;
  opacity: 0.6;
  overflow-y: scroll;
  ul {
    padding-left: 0;
  }
  li {
    line-height: 35px;
    color: #000;
    height: 35px;
    padding-left: 15px;
    border-bottom: 1px dashed #909199;
  }
  li:hover {
    color: blue;

    font-weight: bolder;
  }
}
</style>
