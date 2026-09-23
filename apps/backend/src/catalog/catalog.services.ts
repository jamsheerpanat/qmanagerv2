import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.serviceType.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const serviceType = await this.prisma.serviceType.findUnique({
      where: { id },
      include: {
        categories: true,
        products: true,
        serviceItems: true,
        termsTemplates: true,
      },
    });
    if (!serviceType) throw new NotFoundException();
    return serviceType;
  }

  async create(data: any) {
    return this.prisma.serviceType.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.serviceType.update({ where: { id }, data });
  }
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productCategory.findMany({
      include: { serviceType: true, parent: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: any) {
    return this.prisma.productCategory.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.productCategory.update({ where: { id }, data });
  }
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Never returns the bulky columns. Callers that render a picture use
   * `productThumbnail`; the full `productImage` and the long text fields are
   * only available from findOne, which serves one product at a time.
   */
  async findAll() {
    return this.prisma.product.findMany({
      omit: {
        productImage: true,
        detailedDescription: true,
        technicalSpecification: true,
        installationNotes: true,
        internalNotes: true,
        datasheetAttachment: true,
      },
      include: { category: true, serviceType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Every product with every field, as an .xlsx workbook. The images are left
   * out: they are base64 data URLs far beyond Excel's 32,767-character cell
   * limit, so a "Has Image" column stands in for them. The thumbnail is read
   * only to fill that column.
   */
  async exportToExcel(): Promise<Buffer> {
    const products = await this.prisma.product.findMany({
      omit: { productImage: true },
      include: { category: true, serviceType: true },
      orderBy: [{ productCode: 'asc' }],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('Products', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    const money = '#,##0.000';
    sheet.columns = [
      { header: 'Product Code', key: 'productCode', width: 18 },
      { header: 'Product Name', key: 'productName', width: 36 },
      { header: 'Brand', key: 'brand', width: 16 },
      { header: 'Model Number', key: 'modelNumber', width: 18 },
      { header: 'Category', key: 'category', width: 22 },
      { header: 'Service Type', key: 'serviceType', width: 22 },
      { header: 'Unit', key: 'unit', width: 8 },
      { header: 'Currency', key: 'currency', width: 10 },
      {
        header: 'Cost Price',
        key: 'costPrice',
        width: 13,
        style: { numFmt: money },
      },
      {
        header: 'Selling Price',
        key: 'sellingPrice',
        width: 13,
        style: { numFmt: money },
      },
      {
        header: 'Minimum Selling Price',
        key: 'minimumSellingPrice',
        width: 13,
        style: { numFmt: money },
      },
      { header: 'Taxable', key: 'taxable', width: 9 },
      { header: 'Tax Rate (%)', key: 'taxRate', width: 11 },
      { header: 'Warranty Period', key: 'warrantyPeriod', width: 16 },
      { header: 'Active', key: 'isActive', width: 8 },
      { header: 'Short Description', key: 'shortDescription', width: 40 },
      { header: 'Detailed Description', key: 'detailedDescription', width: 60 },
      {
        header: 'Technical Specification',
        key: 'technicalSpecification',
        width: 60,
      },
      { header: 'Installation Notes', key: 'installationNotes', width: 40 },
      { header: 'Internal Notes', key: 'internalNotes', width: 40 },
      { header: 'Datasheet URL', key: 'datasheetAttachment', width: 40 },
      { header: 'Has Image', key: 'hasImage', width: 10 },
      {
        header: 'Created At',
        key: 'createdAt',
        width: 18,
        style: { numFmt: 'yyyy-mm-dd hh:mm' },
      },
      {
        header: 'Updated At',
        key: 'updatedAt',
        width: 18,
        style: { numFmt: 'yyyy-mm-dd hh:mm' },
      },
      { header: 'Product ID', key: 'id', width: 38 },
      { header: 'Category ID', key: 'categoryId', width: 38 },
      { header: 'Service Type ID', key: 'serviceTypeId', width: 38 },
    ];

    const yesNo = (v: boolean) => (v ? 'Yes' : 'No');
    for (const p of products) {
      const { productThumbnail, category, serviceType, ...fields } = p;
      sheet.addRow({
        ...fields,
        category: category?.name ?? '',
        serviceType: serviceType?.name ?? '',
        taxable: yesNo(p.taxable),
        isActive: yesNo(p.isActive),
        hasImage: yesNo(!!productThumbnail),
      });
    }

    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' },
    };
    header.alignment = { vertical: 'middle', wrapText: true };
    header.height = 30;
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columnCount },
    };

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, serviceType: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: any) {
    if (data.sellingPrice < data.minimumSellingPrice) {
      throw new BadRequestException(
        'Selling price cannot be less than minimum selling price',
      );
    }
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: any) {
    if (
      data.sellingPrice &&
      data.minimumSellingPrice &&
      data.sellingPrice < data.minimumSellingPrice
    ) {
      throw new BadRequestException(
        'Selling price cannot be less than minimum selling price',
      );
    }
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}

@Injectable()
export class ServiceItemsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.serviceItem.findMany({
      include: { serviceType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    if (data.defaultPrice < data.minimumPrice) {
      throw new BadRequestException(
        'Default price cannot be less than minimum price',
      );
    }
    return this.prisma.serviceItem.create({ data });
  }

  async update(id: string, data: any) {
    if (
      data.defaultPrice &&
      data.minimumPrice &&
      data.defaultPrice < data.minimumPrice
    ) {
      throw new BadRequestException(
        'Default price cannot be less than minimum price',
      );
    }
    return this.prisma.serviceItem.update({ where: { id }, data });
  }
}
