<template>
  <AppLayout>
    <div class="page">
      <div class="header">
        <div>
          <h1 class="title">商家管理</h1>
          <p class="desc">配置并监控平台商家及其财务参数。</p>
        </div>
        <div class="actions">
          <button class="btnSecondary">批量设定参数</button>
          <button class="btnPrimary">
            <IconSvg name="plus" />
            <span>从商家库添加商家</span>
          </button>
        </div>
      </div>
      <div class="profitFlow">
        <div class="header">
          <IconSvg name="merchant" class="headerIcon" />
          <span>盈利空间计算逻辑</span>
        </div>
        <div class="body">
          <div class="step">
            <div class="stepIcon"><IconSvg name="money" /></div>
            <div class="stepLabel">消费额</div>
            <div class="stepValue">¥100</div>
          </div>
          <div class="arrow">→</div>
          <div class="step">
            <div class="stepIcon down"><IconSvg name="trend" /></div>
            <div class="stepLabel">兑换成本</div>
            <div class="stepValue">4%</div>
          </div>
          <div class="arrow">→</div>
          <div class="step">
            <div class="stepIcon up"><IconSvg name="chart" /></div>
            <div class="stepLabel">可分利润</div>
            <div class="stepValue">1%</div>
          </div>
          <div class="arrow">→</div>
          <div class="result">
            <div class="resultItem">
              <div class="resultLabel">物业收益</div>
              <div class="resultValue">0.3%</div>
            </div>
            <div class="resultDivider" />
            <div class="resultItem">
              <div class="resultLabel">统筹收益</div>
              <div class="resultValue">0.7%</div>
            </div>
          </div>
        </div>
      </div>
      <div class="table">
        <div class="toolbar">
          <div class="search">
            <IconSvg name="search" />
            <input type="text" placeholder="搜索商家名称..." />
          </div>
          <div class="select">
            <span>所有分类</span>
            <IconSvg name="chevronDown" />
          </div>
          <div class="select">
            <span>所有状态</span>
            <IconSvg name="chevronDown" />
          </div>
          <button class="filter">
            <IconSvg name="filter" />
            <span>高级筛选</span>
          </button>
        </div>
        <table class="content">
          <thead>
            <tr>
              <th>商家名称</th>
              <th>等级</th>
              <th>审核状态</th>
              <th>抽佣比例</th>
              <th>积分兑换比（分/元）</th>
              <th>返现比例</th>
              <th>业主折扣价</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" style="text-align:center;padding:24px;color:#8c8c9a">加载中...</td>
            </tr>
            <tr v-else-if="!merchants.length">
              <td colspan="8" style="text-align:center;padding:24px;color:#8c8c9a">暂无数据</td>
            </tr>
            <template v-else>
            <tr v-for="merchant in merchants" :key="merchant.id">
              <td>
                <div class="info">
                  <div class="avatar"><IconSvg :name="merchant.categoryCode" /></div>
                  <div>
                    <div class="name">{{ merchant.name }}</div>
                    <div class="category">{{ merchant.category }}</div>
                  </div>
                </div>
              </td>
              <td>{{ merchant.merchantLevel }}</td>
              <td>{{ merchant.auditStatus }}</td>
              <td><span class="badge">{{ merchant.commissionRate }}</span></td>
              <td>
                <div class="points"><IconSvg name="coin" /><span>{{ merchant.pointsRatio }}</span></div>
              </td>
              <td>{{ merchant.cashbackRate }}</td>
              <td>{{ merchant.ownerPrice }}</td>
              <td>
                <div class="actions">
                  <button class="edit"><IconSvg name="edit" /><span>编辑</span></button>
                  <span class="status" :class="merchant.status === 'connected' ? 'connected' : 'disconnected'">
                    {{ merchant.status === 'connected' ? '已连接' : '连接' }}
                  </span>
                </div>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
        <div class="footer">
          <span class="total">共 {{ merchants.length }} 条记录</span>
          <div class="pagination">
            <button class="pageBtn" disabled>&lt;</button>
            <button class="pageBtn active">1</button>
            <button class="pageBtn">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>


<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import IconSvg from '../components/IconSvg.vue'
import { merchantApi } from '../api/services'
import { mapMerchants } from '../api/mappers'

const loading = ref(true)
const merchants = ref<ReturnType<typeof mapMerchants>>([])

onMounted(async () => {
  try {
    const res = await merchantApi.list({ page: 1, pageSize: 20 })
    merchants.value = mapMerchants(res.list || [])
  } finally {
    loading.value = false
  }
})
</script>


<style scoped>
.page { max-width: 1200px; }
.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.actions { display: flex; gap: 12px; }
.btnSecondary { padding: 10px 18px; border-radius: 8px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; transition: all 0.2s; }
.btnSecondary:hover { border-color: #5c5c9e; color: #5c5c9e; }
.btnPrimary { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #ffffff; font-size: 14px; transition: background 0.2s; }
.btnPrimary:hover { background: #52529a; }
.btnPrimary svg { width: 18px; height: 18px; }

.profitFlow { background: #ffffff; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.profitFlow .header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 20px; }
.profitFlow .headerIcon { width: 20px; height: 20px; color: #5c5c9e; }
.profitFlow .body { display: flex; align-items: center; gap: 16px; padding: 20px; background: #fafafc; border-radius: 12px; flex-wrap: wrap; }
.profitFlow .step { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 80px; }
.profitFlow .stepIcon { width: 48px; height: 48px; border-radius: 50%; background: #f4f5f7; color: #5c5c66; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.profitFlow .stepIcon svg { width: 24px; height: 24px; }
.profitFlow .stepIcon.down { color: #e05c5c; }
.profitFlow .stepIcon.up { color: #3aaf7d; }
.profitFlow .stepLabel { font-size: 13px; color: #8c8c9a; }
.profitFlow .stepValue { font-size: 16px; font-weight: 600; color: #1f1f2e; }
.profitFlow .arrow { color: #c8c8d0; font-size: 20px; font-weight: 500; }
.profitFlow .result { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #ffffff; border-radius: 10px; border: 1px solid #e8e8ec; margin-left: auto; }
.profitFlow .resultItem { text-align: center; min-width: 80px; }
.profitFlow .resultLabel { font-size: 12px; color: #8c8c9a; margin-bottom: 4px; }
.profitFlow .resultValue { font-size: 18px; font-weight: 600; color: #5c5c9e; }
.profitFlow .resultDivider { width: 1px; height: 36px; background: #e8e8ec; }

.table { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden; }
.table .toolbar { display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-bottom: 1px solid #f0f0f3; flex-wrap: wrap; }
.table .search { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 240px; padding: 10px 14px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fafafc; }
.table .search svg { width: 18px; height: 18px; color: #8c8c9a; }
.table .search input { flex: 1; border: none; background: transparent; font-size: 14px; color: #1f1f2e; outline: none; }
.table .search input::placeholder { color: #8c8c9a; }
.table .select { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1px solid #e8e8ec; border-radius: 8px; font-size: 14px; color: #5c5c66; cursor: pointer; min-width: 110px; justify-content: space-between; }
.table .select svg { width: 16px; height: 16px; color: #8c8c9a; }
.table .filter { display: flex; align-items: center; gap: 6px; margin-left: auto; font-size: 14px; color: #5c5c9e; }
.table .filter svg { width: 18px; height: 18px; }
.table .content { width: 100%; font-size: 14px; }
.table .content thead th { text-align: left; padding: 14px 24px; color: #8c8c9a; font-weight: 500; background: #fafafc; border-bottom: 1px solid #f0f0f3; }
.table .content tbody td { padding: 16px 24px; color: #1f1f2e; border-bottom: 1px solid #f0f0f3; vertical-align: middle; }
.table .content tbody tr:last-child td { border-bottom: none; }
.table .info { display: flex; align-items: center; gap: 12px; }
.table .avatar { width: 44px; height: 44px; border-radius: 10px; background: #f4f5f7; color: #5c5c9e; display: flex; align-items: center; justify-content: center; }
.table .avatar svg { width: 24px; height: 24px; }
.table .name { font-weight: 500; color: #1f1f2e; margin-bottom: 4px; }
.table .category { font-size: 12px; color: #8c8c9a; }
.table .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; background: #eef0f5; color: #5c5c66; }
.table .points { display: flex; align-items: center; gap: 6px; color: #5c5c66; }
.table .points svg { width: 16px; height: 16px; color: #f5a623; }
.table .actions { display: flex; align-items: center; gap: 12px; }
.table .edit { display: flex; align-items: center; gap: 4px; font-size: 14px; color: #5c5c66; }
.table .edit svg { width: 16px; height: 16px; }
.table .status { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.table .status.connected { background: #e8f8f0; color: #3aaf7d; }
.table .status.connected::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #3aaf7d; }
.table .status.disconnected { background: #f0f0ff; color: #5c5c9e; border: 1px solid #d0d0ff; cursor: pointer; }
.table .footer { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; border-top: 1px solid #f0f0f3; }
.table .total { font-size: 13px; color: #8c8c9a; }
.table .pagination { display: flex; gap: 8px; }
.table .pageBtn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; }
.table .pageBtn:disabled { color: #c8c8d0; cursor: not-allowed; }
.table .pageBtn.active { background: #5c5c9e; color: #ffffff; border-color: #5c5c9e; }

@media (max-width: 640px) {
  .page > .header { flex-direction: column; gap: 16px; }
  .page > .header .actions { width: 100%; flex-wrap: wrap; }
}
@media (max-width: 768px) {
  .profitFlow .result { margin-left: 0; width: 100%; }
}
@media (max-width: 900px) {
  .table .content { display: block; overflow-x: auto; }
  .table .toolbar { flex-direction: column; align-items: stretch; }
  .table .filter { margin-left: 0; }
}
</style>
