import {
  Configuration,
  TodosApi,
  FetchParams,
  HTTPMethod,
  Middleware,
  RequestContext,
  UsersApi
} from './generated-rest-client';

class CsrfTokenAttachment implements Middleware {

  private readonly targetMethod: ReadonlyArray<HTTPMethod> = ['POST', 'PUT', 'DELETE', 'PATCH'];
  private headerName = '';
  private tokenValue = '';

  setCsrfToken(headerName: string, tokenValue: string) {
    console.log('setCsrfToken:', headerName, tokenValue);
    this.headerName = headerName;
    this.tokenValue = tokenValue;
  }

  pre = async (context: RequestContext): Promise<FetchParams | void> => {
    if (!this.headerName || !this.targetMethod.includes(context.init.method as HTTPMethod)) {
      return;
    }
    console.log('attach csrf token:', this.headerName, this.tokenValue);
    return {
      url: context.url,
      init: {
        ...context.init,
        headers : {
          ...context.init.headers,
          [this.headerName]: this.tokenValue
        }
      }
    };
  }
}

const csrfTokenAttachment = new CsrfTokenAttachment();

const requestLogger: Middleware = {
  pre: async (context) => {
    console.log(`>> ${context.init.method} ${context.url}`, context.init);
  },
  post: async (context) => {
    console.log(`<< ${context.response.status} ${context.url}`, context.response);
  }
}

const corsHandler: Middleware = {
  pre: async (context) => {
    return {
      url: context.url,
      init: {
        ...context.init,
        mode: 'cors',
        credentials: 'include'
      }
    };
  }
}

const configuration = new Configuration({
  middleware: [csrfTokenAttachment, corsHandler, requestLogger]
});

const todosApi = new TodosApi(configuration);

const usersApi = new UsersApi(configuration);

const refreshCsrfToken = async () => {
  const response = await usersApi.getCsrfToken();
  csrfTokenAttachment.setCsrfToken(response.csrfTokenHeaderName, response.csrfTokenValue);
};

const signup = async (userName: string, password: string) => {
  return usersApi.signup({ inlineObject2 : { userName, password }});
};

const login = async (userName: string, password: string) => {
  return usersApi.login({ inlineObject3: { userName, password }});
};

const logout = async () => {
  return usersApi.logout();
};

const getTodos = async () => {
  return todosApi.getTodos();
};

const postTodo = async (text: string) => {
  return todosApi.postTodo({ inlineObject: { text }});
}

const putTodo = async (todoId: number, completed: boolean) => {
  return todosApi.putTodo({ todoId, inlineObject1: { completed }});
};

export const BackendService = {
  signup,
  login,
  logout,
  getTodos,
  postTodo,
  putTodo,
  refreshCsrfToken
};
