import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MongoIdParamDto {
  @ApiProperty({ description: 'MongoDB ObjectId', example: '60d0fe4f5311236168a109ca' })
  @IsMongoId({ message: 'Invalid MongoDB ObjectId identifier format' })
  id: string;
}

