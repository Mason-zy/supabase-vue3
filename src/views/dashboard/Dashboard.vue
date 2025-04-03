<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">仪表盘</h1>
      <div class="dashboard-actions">
        <el-radio-group v-model="timeRange" size="small">
          <el-radio-button label="day">日</el-radio-button>
          <el-radio-button label="week">周</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
          <el-radio-button label="year">年</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon green">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">安全指标完成率</div>
                <div class="stat-value">92<span class="unit">%</span></div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon blue">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">安全运行天数</div>
                <div class="stat-value">365<span class="unit">天</span></div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon orange">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">本月事故数</div>
                <div class="stat-value">0<span class="unit">起</span></div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon purple">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">安全培训完成率</div>
                <div class="stat-value">88<span class="unit">%</span></div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span>安全指标趋势</span>
          <el-button type="primary" link>查看更多</el-button>
        </div>
      </template>
      
      <div class="chart-placeholder">
        <el-empty 
          description="图表开发中..." 
          :image-size="120"
        >
          <el-button type="primary">查看数据</el-button>
        </el-empty>
      </div>
    </el-card>
    
    <el-row :gutter="20" class="dashboard-bottom">
      <el-col :span="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>最近事故记录</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <div class="chart-placeholder small">
            <el-empty 
              description="开发中..." 
              :image-size="80"
            />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <div class="chart-placeholder small">
            <el-empty 
              description="开发中..." 
              :image-size="80"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrendCharts, Timer, Warning, Document } from '@element-plus/icons-vue'

// 时间范围选择
const timeRange = ref('month')
</script>

<style scoped lang="scss">
.dashboard {
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .page-title {
      margin: 0;
      font-size: 20px;
      color: $primary-color;
    }
  }
  
  .stats-overview {
    margin-bottom: 20px;
    
    .stat-card {
      height: 120px;
      
      .stat-content {
        display: flex;
        height: 100%;
        align-items: center;
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          
          .el-icon {
            font-size: 24px;
            color: white;
          }
          
          &.green {
            background-color: $success-color;
          }
          
          &.blue {
            background-color: $light-blue;
          }
          
          &.orange {
            background-color: $secondary-color;
          }
          
          &.purple {
            background-color: #8b5cf6;
          }
        }
        
        .stat-info {
          .stat-label {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 5px;
          }
          
          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: #333;
            
            .unit {
              font-size: 16px;
              font-weight: normal;
              margin-left: 5px;
              color: #64748b;
            }
          }
        }
      }
    }
  }
  
  .chart-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      span {
        font-size: 16px;
        font-weight: 500;
      }
    }
    
    .chart-placeholder {
      padding: 40px 0;
      display: flex;
      justify-content: center;
      
      &.small {
        padding: 20px 0;
      }
    }
  }
  
  .dashboard-bottom {
    .table-card {
      height: 300px;
      
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        span {
          font-size: 16px;
          font-weight: 500;
        }
      }
    }
  }
}
</style> 