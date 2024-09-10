<template>
  <div class="station">
    <div class="btn-box1 mb10" v-if="formInfo.types !== 3">
      <div class="title-16">合同列表</div>
      <el-button size="small" type="primary" @click="addContract">添加合同</el-button>
    </div>
    <el-table :data="contractData" fit style="width: 100%">
      <el-table-column prop="contract_name" :label="$t('customer.contractname')"> </el-table-column>
      <el-table-column prop="contract_price" min-width="100px" :label="$t('customer.contractpay')"> </el-table-column>

      <el-table-column prop="surplus" label="付款状态">
        <template slot-scope="scope">
          <span class="pointer color-success" v-if="parseFloat(scope.row.surplus) === 0">已结清</span>
          <span class="pointer color-warning" v-else>未结清</span>
        </template>
      </el-table-column>
      <el-table-column prop="contract_status" label="合同状态">
        <template slot-scope="scope">
          <el-tag :type="getAbnormalTag(scope.row)">{{ getAbnormalTexts(scope.row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="creator.name" label="创建人"> </el-table-column>
      <el-table-column prop="address" :label="$t('public.operation')">
        <template slot-scope="scope">
          <el-button @click="handleCheck(scope.row)" type="text">{{ $t('public.check') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        :page-size="where.limit"
        :current-page="where.page"
        layout="total, prev, pager, next, jumper"
        :total="contractTotal"
        @current-change="pageChange"
      />
    </div>

    <!-- 弹窗 -->
    <editContract ref="editContract" :form-data="fromData" @isOk="getTableData"></editContract>
    <add-contract ref="addContract" @getTableData="getTableData()" :form-data="contractFromData"></add-contract>
  </div>
</template>

<script>
import { clientContractListApi } from '@/api/enterprise'
import { getContractTagType, getContractText } from '@/libs/customer'
export default {
  name: 'Contract',
  components: {
    addContract: () => import('@/views/customer/contract/components/addContract'),
    editContract: () => import('@/views/customer/contract/components/editContract')
  },
  props: {
    formInfo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      where: {
        eid: 0,
        page: 1,
        limit: 15,
        types: 7
      },
      contractTotal: 0,
      contractData: [],
      fromData: {},
      contractFromData: {}
    }
  },
  methods: {
    getTableData() {
      this.where.eid = this.formInfo.data.eid
      clientContractListApi(this.where).then((res) => {
        this.contractData = res.data.list
        this.contractTotal = res.data.count
      })
    },

    // 添加合同
    addContract() {
      this.contractFromData = {
        title: this.$t('customer.addcontract'),
        id: this.formInfo.data.eid,
        name: this.formInfo.data.name,
        edit: false,
        width: '570px'
      }
      this.$refs.addContract.openBox()
    },
    async handleCheck(item) {
      item.cid = item.id
      this.fromData = {
        title: this.$t('customer.viewcustomer'),
        width: '1000px',
        data: item,
        isClient: false,
        edit: true
      }

      await this.$nextTick()
      this.$refs.editContract.tabIndex = '1'
      this.$refs.editContract.tabNumber = 1
      this.$refs.editContract.openBox(item)
    },
    getAbnormalTag(row) {
      return getContractTagType(row)
    },
    getAbnormalTexts(row) {
      return getContractText(row)
    },
    pageChange(val) {
      this.where.page = val
      this.getTableData()
    }
  }
}
</script>

<style lang="scss" scoped>
.color1 {
  color: #ff9900;
}
.color2 {
  color: #19be6b;
}
.color3 {
  color: #ed4014;
}
.btn-box1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
}

/deep/ .el-input__inner {
  text-align: left;
}
.from-item-title {
  border-left: 5px solid #1890ff;
  span {
    padding-left: 10px;
    font-weight: bold;
    font-size: 14px;
  }
}
/deep/.el-tag {
  background-color: transparent;
}
</style>
