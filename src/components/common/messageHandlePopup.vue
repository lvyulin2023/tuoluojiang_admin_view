<!-- @FileDescription: 公共-侧边消息提示-点击对应的弹窗组件 -->
<template>
  <div>
    <!--汇报相关-->
    <addBox ref="addBox" v-if="addBoxShow" :edit-data="editData" :daily-id="1" :edit-id="editId" />
    <!--审批相关-->
    <detail-examine ref="detailExamine" />
    <!--付款记录相关-->
    <apply-for-payment ref="applyForPayment" :form-data="applyData" />
    <!--发票相关-->
    <invoice-details :form-data="invoiceData" ref="invoiceView" />
    <!--付款提醒相关-->
    <edit-contract ref="editContract" :form-data="contractData" />
    <!--客户相关-->
    <edit-customer ref="editCustomer" :form-data="customerData" />
  </div>
</template>

<script>
import { toMessageDetailUrl } from '@/libs/public'
import { clientBillDetailApi, clientContractDetailApi, clientInvoiceDetailApi } from '@/api/enterprise'
export default {
  name: 'index',
  components: {
    addBox: () => import('@/views/user/daily/components/addBox'),
    detailExamine: () => import('@/views/user/examine/components/detailExamine'),
    applyForPayment: () => import('@/views/customer/list/components/applyForPayment'),
    invoiceDetails: () => import('@/components/invoice/invoiceDetails'),
    editContract: () => import('@/views/customer/contract/components/editContract'),
    editCustomer: () => import('@/views/customer/list/components/editCustomer')
  },
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      editData: {},
      editId: 0,
      addBoxShow: false,
      applyData: {},
      invoiceData: {},
      contractData: {},
      customerData: {},
      selectedType: ['delete', 'recall'],
      openTemplateType: [
        'daily_remind',
        'daily_show_remind',
        'daily_update_remind',
        'business_approval',
        'business_adopt_apply',
        'business_adopt_cc',
        'business_fail',
        'business_recall',
        'contract_renew',
        'contract_return_money',
        'finance_verify_success',
        'finance_verify_fail',
        'contract_invoice',
        'finance_invoice_open',
        'finance_invoice_close',
        'finance_invoice_verify_fail',
        'finance_invoice_verify_success',
        'contract_urgent_renew',
        'contract_day_remind',
        'contract_overdue_remind',
        'contract_overdue_day_remind',
        'contract_abnormal',
        'contract_soon_overdue_remind',
        'dealt_client_work',
        'dealt_money_work',
        'contract_expend'
      ]
    }
  },
  methods: {
    openMessage(item, row) {
      let id = null
      if (!this.openTemplateType.includes(this.detail.template_type)) {
        this.$bus.$emit('message-close-pop')
        toMessageDetailUrl(item)
      } else {
        const type = this.detail.template_type
        if (
          [
            'contract_expend',
            'contract_renew',
            'contract_return_money',
            'finance_verify_success',
            'finance_verify_fail'
          ].includes(type)
        ) {
          id = this.detail.other.id
        } else {
          id = this.detail.link_id
        }

        if (type === 'daily_remind') {
          this.addBoxShow = true
          // 填写日报
          setTimeout(() => {
            this.$refs.addBox.getCompletedFn()
            this.$refs.addBox.drawer = true
            this.$refs.addBox.editType = false
          }, 300)
        } else if (type === 'daily_show_remind' || type === 'daily_update_remind') {
          // 日报查看
          this.editId = id
          this.$refs.addBox.getInfo(id, true)
        } else if (
          [
            'business_approval',
            'business_adopt_apply',
            'business_adopt_cc',
            'business_fail',
            'business_recall'
          ].includes(type)
        ) {
          // 审批
          this.$refs.detailExamine.openBox({ id: id == 0 ? this.detail.other.id : id })
        } else if (
          [
            'contract_renew',
            'contract_return_money',
            'finance_verify_success',
            'finance_verify_fail',
            'contract_expend'
          ].includes(type)
        ) {
          // 付款审核
          this.getClientBillDetail(id)
        } else if (
          [
            'contract_invoice',
            'finance_invoice_open',
            'finance_invoice_close',
            'finance_invoice_verify_fail',
            'finance_invoice_verify_success'
          ].includes(type)
        ) {
          this.getClientInvoiceDetail(id)
        } else if (
          // 客户合同
          [
            'contract_urgent_renew',
            'contract_day_remind',
            'contract_overdue_remind',
            'contract_overdue_day_remind',
            'contract_abnormal',
            'contract_soon_overdue_remind',
            'dealt_money_work'
          ].includes(type)
        ) {
          this.getClientContractDetail(item, row)
        } else if (type === 'dealt_client_work') {
          // 客户
          this.getClientDataDetail(id)
        }
      }
    },
    // 付款详情
    getClientBillDetail(id) {
      clientBillDetailApi(id).then((res) => {
        this.applyData = {
          title: this.$t('customer.viewcustomer'),
          width: '500px',
          data: res.data,
          isClient: false,
          edit: true
        }
        this.$refs.applyForPayment.openBox()
      })
    },
    // 发票详情
    getClientInvoiceDetail(id) {
      clientInvoiceDetailApi(id).then((res) => {
        this.invoiceData = {
          title: '发票查看',
          width: '1000px',
          data: res.data
        }
        // 判断是否未财务发票
        if (this.detail.template_type === 'contract_invoice') {
          this.invoiceData.follType = 'fd'
        }
        this.$refs.invoiceView.openBox(res.data.link_id)
      })
    },
    // 客户合同详情
    getClientContractDetail(item, row) {
      let link_id = item.link_id ? item.link_id : row.link_id

      clientContractDetailApi(link_id)
        .then(async (res) => {
          const data = res.data
          this.contractData = {
            title: '查看客户',
            width: '1000px',
            data: row,
            isClient: false,
            name: row.client ? row.client.name : '',
            id: row.client ? row.client.id : '',
            edit: true
          }
          this.$refs.editContract.tabIndex = '1'
          this.$refs.editContract.tabNumber = 1
          await this.$nextTick()
          row.id = link_id
          row.cid = row.id
          this.$refs.editContract.openBox(row)
        })
        .catch((error) => {
          this.$message.error(error.message)
        })
    },
    // 客户详情V1.4
    getClientDataDetail(id) {
      chargeDetailsApi(id).then(async (res) => {
        const data = res.data
        data.eid = data.id
        this.customerData = {
          title: this.$t('customer.editcustomer'),
          width: '1000px',
          data: data,
          isClient: true,
          edit: true
        }
        this.$refs.editCustomer.tabIndex = '1'
        this.$refs.editCustomer.tabNumber = 1
        this.$refs.editCustomer.openBox(id)
      })
    }
  }
}
</script>

<style scoped lang="scss"></style>
