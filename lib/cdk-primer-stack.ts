import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as apigw from '@aws-cdk/aws-apigateway';
import { HitCounter } from './hitcounter';

export class CdkPrimerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const PrimerRole = iam.Role.fromRoleArn(
      this,
      'imported-role',
      `arn:aws:iam::${cdk.Stack.of(this).account}:role/CDKPrimerHelloHandlerLambdaRole`,
      {mutable: false},
    );

    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,    // run environment
      code: lambda.Code.fromAsset('lambda'),  // code loaded from "Lambda" directory
      handler: 'hello.handler',                // file is "hello", function is "handler"
      role: PrimerRole,
      description: 'aws:states:opt-out'
    });
    
    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });
    
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler,
      cloudWatchRole: false
    });

  }
}
