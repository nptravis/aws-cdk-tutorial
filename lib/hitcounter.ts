import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export interface HitCounterProps {
  /** the function for which you want to count url hits **/
  downstream: lambda.IFunction;
}

export class HitCounter extends cdk.Construct {
  public readonly handler: lambda.Function;
  
  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id);
    
    const PrimerHitCounterRole = iam.Role.fromRoleArn(
      this,
      'imported-role',
      `arn:aws:iam::${cdk.Stack.of(this).account}:role/HelloHitCounterServiceRole`,
      {mutable: false},
    );


    const table = new dynamodb.Table(this, 'Hits', {
        partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'hitcounter.handler',
        role: PrimerHitCounterRole,
        description: 'aws:states:opt-out',
        code: lambda.Code.fromAsset('lambda'),
        environment: {
            DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
            HITS_TABLE_NAME: table.tableName
        }
    });
    
    // grant the Lambda role read/write permissions to your table
    table.grantReadWriteData(this.handler);

    // grant the Lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);

  }
}