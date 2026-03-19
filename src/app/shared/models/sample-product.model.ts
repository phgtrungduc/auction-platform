export class AuctionV1Model {
    attachments: AuctionAttachmentModel[] = [];
    assets: ProductAuctingModel[] = [];
    source_id = '';
    source_notice_id = '';
    source_url = '';
    title = '';
    auction_org_name = '';
    auction_org_address = '';
    asset_owner_name = '';
    asset_owner_address = '';
    doc_sale_start: Date = new Date();
    doc_sale_end: Date = new Date();
    viewing_start = '';
    viewing_end = '';
    auction_datetime: Date = new Date();
    publish_date: Date = new Date();
    auction_location = '';
    status = '';
    auction_method = ''; 
    contact_phone = '';
    contact_email = '';
    fingerprint = '';
    crawl_page: number = 0;
    image_main = '';
}
export class AuctionAttachmentModel {
    file_name = '';
    file_url = '';
    file_type = '';
}
export class ProductAuctingModel {
    source_asset_id= '';
    title= '';
    description= '';
    asset_type= '';
    asset_sub_type= '';
    legal_category= '';
    starting_price: number = 0;
    deposit_amount: number = 0;
    winning_price: number = 0;
    asset_location= '';
    province_code= '';
    district_code= '';
    land_area: number = 0;
    land_purpose= '';
    property_type_id= '';
    property_type_name= '';
}