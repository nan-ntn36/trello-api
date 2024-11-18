// tính toán skip phuc vụ tác vụ phân trang

export const pagingSkipValue = (page, itemsPerPage) => {
  if (!page || !itemsPerPage) return 0 ;
  if (page <= 0 || itemsPerPage <= 0 ) return;
  /**
     *  Công thức
     * VD 1 page có 12 sản phẩm (itemsPerPage = 12 )
     * Case 1: user đứng page 1 (page =1 ) thì sẽ lấy 1 - 1 = 0 sau đó nhân với 12 thì cũng = 0 lúc này giá trị skip là 0
     * Case 2: user đứng page 2 (page =2 ) thì lấy 2 - 1 = 1  sau đó nhân với 12 thì cũng = 12 thì lúc này giá trị skip là 12 nghĩa là skip 12 bản ghi của trang page 1 .... tương tự cho các page khác
     *
     */
  return (page -1 ) * itemsPerPage;
}