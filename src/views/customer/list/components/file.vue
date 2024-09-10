<!-- 客户-附件页面组件 -->
<template>
  <div class="station">
    <div v-if="formInfo.types !== 3" class="mb10 btn-box1">
      <div class="title-16">附件列表</div>
      <el-upload
        :headers="myHeaders"
        :http-request="uploadServerLog"
        :show-file-list="false"
        action="##"
        class="mr10 upload-real"
      >
        <el-button v-if="!percentShow" size="small" type="primary">
          <i class="el-icon-plus"></i>
          添加文件
        </el-button>
        <div v-else class="addText">
          <img alt="" class="l_gif" src="../../../../assets/images/loading.gif" />
        </div>
      </el-upload>
    </div>
    <el-table :data="fileData">
      <el-table-column :label="$t('hr.documentcover')" prop="name" width="80">
        <template slot-scope="scope">
          <i
            v-if="toSrcIcon(scope.row.name) !== 'img'"
            :class="toSrcIcon(scope.row.name)"
            class="icon iconfont icon-cover pointer"
            @click="lookViewer(scope.row.att_dir, scope.row.name)"
          />
          <img v-else :src="scope.row.att_dir" alt="" class="img" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('customer.filename')" min-width="180" prop="real_name">
        <template slot-scope="scope">
          <span class="over-text">{{ scope.row.real_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="附件大小" min-width="180" prop="att_size">
        <template slot-scope="scope">
          <span class="over-text">{{ formatBytesFn(scope.row.att_size) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('customer.uploaduser')" min-width="100" prop="card.name" />
      <el-table-column :label="$t('customer.uploaddate')" min-width="130" prop="created_at">
        <template slot-scope="scope">
          <span class="over-text">{{ $moment(scope.row.created_at).format('YYYY-MM-DD') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('public.operation')" fixed="right" prop="address" width="180">
        <template slot-scope="scope">
          <el-button v-if="isFileImage(scope.row.name)" type="text" @click="lookViewer(scope.row.att_dir)">
            {{ $t('public.check') }}
          </el-button>

          <el-button type="text" @click="getFileLinkDownLoad(scope.row.att_dir, scope.row.name)">
            {{ $t('public.download') }}
          </el-button>

          <el-button v-if="!isFileImage(scope.row.name)" type="text" @click="handleLabel(scope.row)">
            重命名
          </el-button>

          <el-button v-if="!isFileImage(scope.row.name)" type="text" @click="handleFileDelete(scope.row, scope.$index)">
            删除</el-button
          >

          <el-dropdown v-if="isFileImage(scope.row.name)">
            <span class="el-dropdown-link el-button--text el-button ml10">
              {{ $t('hr.more') }}
              <i class="el-icon-arrow-down" />
            </span>
            <el-dropdown-menu style="text-align: center">
              <el-dropdown-item v-if="isFileImage(scope.row.name)" @click.native="handleLabel(scope.row)">
                重命名
              </el-dropdown-item>

              <el-dropdown-item @click.native="handleFileDelete(scope.row, scope.$index)">
                {{ $t('public.delete') }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        :current-page="where.page"
        :page-size="where.limit"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="pageChange"
      />
    </div>

    <image-viewer ref="imageViewer" :src-list="srcList"></image-viewer>
    <!-- 重命名弹窗 -->
    <el-dialog :append-to-body="true" :visible.sync="dialogFormVisible" title="修改文件名" width="40%">
      <el-form>
        <el-form-item label="重命名：" label-width="100px">
          <el-input v-model="real_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="putRealName">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { uploader } from '@/utils/uploadCloud'
import { clientFileDeleteApi, clientFileListApi, putRealName } from '@/api/enterprise'
import { fileLinkDownLoad, formatBytes, getFileType, isTypeImage } from '@/libs/public'
export default {
  name: 'File',
  props: {
    formInfo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  components: {
    imageViewer: () => import('@/components/common/imageViewer')
  },
  data() {
    return {
      real_name: '',
      fileName: '',
      RealNameId: '',
      dialogFormVisible: false,
      fileData: [],
      where: {
        page: 1,
        limit: 15,
        eid: 0,
        cid: 0
      },
      percentShow: false,
      percent: 0,
      timer: null,
      total: 0,
      loading: false,
      srcList: [],
      fileParams: {},
      myHeaders: {
        authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }
  },
  mounted() {
    // 设置上传参数
    this.fileParams.relation_type = 'client'
    this.fileParams.eid = this.formInfo.data.eid
    this.fileParams.cid = this.formInfo.data.cid
    this.where.eid = this.formInfo.data.eid
    this.where.cid = this.formInfo.data.cid
  },
  methods: {
    getTableData() {
      this.fileParams.eid = this.formInfo.data.eid
      clientFileListApi(this.where).then((res) => {
        this.fileData = res.data.list
        this.fileParams.eid = this.formInfo.data.eid
        this.total = res.data.count
        if (this.fileData.length > 0) {
          this.fileData.map((value) => {
            if (this.fileIsImage(value.att_type)) {
              this.srcList.push(value.att_dir)
            }
          })
        }
      })
    },

    pageChange(val) {
      this.where.page = val
      this.getTableData()
    },
    formatBytesFn(size) {
      if (size) {
        return formatBytes(Number(size))
      } else {
        return '--'
      }
    },

    uploadServerLog(params) {
      this.percentShow = true
      const file = params.file
      uploader(file, 0, 15, this.fileParams)
        .then((res) => {
          // 获取上传文件渲染页面
          if (res.name) {
            this.getTableData()
            this.percentShow = false
          }
        })
        .catch((err) => {
          this.percentShow = false
        })
    },

    toSrcIcon(name) {
      return getFileType(name)
    },
    // 查看与下载附件
    lookViewer(url, name = '') {
      if (isTypeImage(url)) {
        this.$refs.imageViewer.openImageViewer(url)
      } else {
        fileLinkDownLoad(url, name)
      }
    },
    getFileLinkDownLoad(url, name) {
      fileLinkDownLoad(url, name)
    },
    isFileImage(name) {
      return isTypeImage(name)
    },
    // 重命名
    handleLabel(row) {
      this.RealNameId = row.id
      this.dialogFormVisible = true
      this.real_name = row.real_name
    },
    putRealName() {
      let data = {
        real_name: this.real_name
      }
      putRealName(this.RealNameId, data).then((res) => {
        this.dialogFormVisible = false
        this.getTableData()
      })
    },
    // 删除附件
    handleFileDelete(row, index) {
      this.$modalSure('附件删除后，不可恢复，确认要删除吗').then(() => {
        clientFileDeleteApi(row.id).then((res) => {
          this.fileData.splice(index, 1)
          if (this.where.page > 1 && this.fileData.length <= 0) {
            this.where.page--
          }
          this.getTableData()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.percent {
  margin-top: 20px;
}
.station {
  height: 100%;
}
.img {
  display: inline-block;
  width: 30px;
  height: 30px;
}
/deep/ .el-input__inner {
  text-align: left;
}
.icon-cover {
  font-size: 28px;
}
.el-button {
  font-size: 13px !important;
}
.btn-box1 {
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ml10 {
  margin-left: 10px;
}
</style>
