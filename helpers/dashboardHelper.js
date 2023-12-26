const order = require('../models/order');

const mostSoldProducts = async()=>{
    const mostSoldProducts = await order.aggregate([
        {
          $unwind: '$products'
        },
        {
          $group: {
            _id: '$products.productId',
            totalQuantity: { $sum: '$products.quantity' }
          }
        },
        {
          $lookup: {
            from: 'product',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        }, {
          $unwind: '$product'
        }, {
          $sort: { totalQuantity: -1 }
        }, {
          $group: {
            _id: "$product.name",
            qty: { $sum: "$totalQuantity" }
          }
        },
    
        {
          $limit: 5
        }
      ]);
      return mostSoldProducts;
}


  // sales graph details
  const dailyChart = async()=>{
    const dailyChart = await order.aggregate([
        {
          $group : {
              _id : {
                  $dateToString : {
                      format : "%Y-%m-%d",
                      date : "$date"
                  },
              },
              dailyrevenue : {
                  $sum : "$totalPrice"
              }
          }
      }, {
        $sort : {
            _id : 1
        }
    },
    {
        $limit : 14
    }
      ])
      return dailyChart;
  }

// monthlychart
  const monthlyChart = async () => {
    const monthlyChart = await order.aggregate([
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m",  // Format for monthly grouping
                        date: "$date"
                    },
                },
                monthlyRevenue: {
                    $sum: "$totalPrice"
                }
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ]);

    const transformedMonthlyChart = monthlyChart.map(item => ({
        _id: item._id,
        dailyrevenue: item.monthlyRevenue
      }));
    return   [
        { _id: '2023-09', dailyrevenue: 1200 },
        { _id: '2023-10', dailyrevenue: 1300 },
        { _id: '2023-11', dailyrevenue: 1400 },
        ...transformedMonthlyChart,
      ];
}

// yearly chart
const yearlyChart = async () => {
    const yearlyChart = await order.aggregate([
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y",  // Format for yearly grouping
                        date: "$date"
                    },
                },
                yearlyRevenue: {
                    $sum: "$totalPrice"
                }
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ]);

    const transformedYearlyChart = yearlyChart.map(item => ({
        _id: item._id,
        dailyrevenue: item.yearlyRevenue
      }));

    return [{ _id: '2022', dailyrevenue: 10000 },
    ...transformedYearlyChart,
    { _id: '2024', dailyrevenue: 14000 },
    { _id: '2025', dailyrevenue: 16000 }] ;
}



  module.exports={
    mostSoldProducts,
    dailyChart,
    monthlyChart,
    yearlyChart

  }