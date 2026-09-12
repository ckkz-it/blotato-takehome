export type CommentCreatedCondition = {
  field: "text";
  operator: "equals";  // can support other operators in the future
  value: string;
};

// can be also more generic
export type AutomationStep =
  | {
      type: "reply_to_comment";
      text: string;
    }
  | {
      type: "send_dm";
      text: string;
    }
  | {
      type: "wait_for_message";
      validator: "email";
    };

type AutomationMetadata = {
  id: string;
  version: number;
};

export interface ConditionalCommentCreatedAutomation extends AutomationMetadata {
  trigger: {
    type: "comment_created";
    conditions: [CommentCreatedCondition, ...CommentCreatedCondition[]];
  };
  steps: AutomationStep[];
}

// just to demonstrate how the domain can grow
// trigger matching for it is not implemented
export interface AnyCommentCreatedAutomation extends AutomationMetadata {
  trigger: {
    type: "comment_created";
  };
  steps: AutomationStep[];
}

export type Automation = ConditionalCommentCreatedAutomation | AnyCommentCreatedAutomation;

export type AutomationDefinition =
  | Omit<ConditionalCommentCreatedAutomation, keyof AutomationMetadata>
  | Omit<AnyCommentCreatedAutomation, keyof AutomationMetadata>;
